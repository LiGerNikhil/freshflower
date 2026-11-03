import { PassThrough, Readable } from "node:stream";
import path from "node:path";
import PDFDocument from "pdfkit";
import { NextRequest } from "next/server";
import { CustomerModel, DeliverySlotModel, OrderModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { requireAdminRole } from "@/lib/admin/authorization";
import {
  eligibleOrderFilter,
  ORDER_EXPORT_TIME_WINDOW,
  orderExportFilename,
  parseOrderExportRange,
} from "@/lib/admin/order-export";
import { safe } from "@/lib/api/helpers";
import { AdminRole } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const LEFT = 44;
const RIGHT = 44;
const CONTENT_WIDTH = PAGE_WIDTH - LEFT - RIGHT;
const CONTENT_START = 106;
const CONTENT_BOTTOM = PAGE_HEIGHT - 54;
const BATCH_SIZE = 100;

type ExportOrder = {
  _id: string;
  orderNumber: string;
  customerId: string;
  items: Array<{
    name: string;
    color?: string;
    quantity: number;
    unitLabel?: string;
    price: number;
  }>;
  total: number;
  status: string;
  createdAt: Date;
  deliveryDate?: Date;
  deliverySlotId?: string;
  deliveryTimePreference?: string;
  deliveryAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    pincode?: string;
    landmark?: string;
  };
};

type ExportCustomer = {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

type ExportDeliverySlot = {
  _id: string;
  label?: string;
  startTime?: string;
  endTime?: string;
};

type PdfRow = {
  text: string;
  font: "Helvetica" | "Helvetica-Bold";
  size: number;
  color: string;
  gap: number;
  indent?: number;
};

function formatRupees(amount: number): string {
  return `INR ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(amount)}`;
}

function pdfSafeText(value: string): string {
  return value
    .replace(/[₹]/g, "INR ")
    .replace(/[×]/g, "x")
    .replace(/[•·]/g, "-")
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\xFF]/g, "?");
}

function formatIndiaDate(value: Date | string, includeTime = false): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit", hour12: true } : {}),
  }).format(new Date(value));
}

function orderAddress(order: ExportOrder): string {
  const address = order.deliveryAddress;
  if (!address) return "Address unavailable";
  return [
    address.line1,
    address.line2,
    address.landmark ? `Landmark: ${address.landmark}` : undefined,
    address.city,
    address.pincode,
  ]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(", ") || "Address unavailable";
}

function deliverySlotLabel(order: ExportOrder, slot?: ExportDeliverySlot): string {
  return (
    order.deliveryTimePreference ||
    slot?.label ||
    [slot?.startTime, slot?.endTime].filter(Boolean).join(" - ") ||
    order.deliverySlotId ||
    "Not specified"
  );
}

function wrapText(
  doc: PDFKit.PDFDocument,
  text: string,
  width: number,
  font: PdfRow["font"],
  size: number,
): string[] {
  doc.font(font).fontSize(size);
  text = pdfSafeText(text);
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (doc.widthOfString(word) > width) {
      if (line) {
        lines.push(line);
        line = "";
      }
      let part = "";
      for (const character of word) {
        if (part && doc.widthOfString(`${part}${character}`) > width) {
          lines.push(part);
          part = character;
        } else {
          part += character;
        }
      }
      line = part;
      continue;
    }
    const candidate = line ? `${line} ${word}` : word;
    if (doc.widthOfString(candidate) <= width || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function orderRows(
  order: ExportOrder,
  customer?: ExportCustomer,
  deliverySlot?: ExportDeliverySlot,
): PdfRow[] {
  const customerName =
    customer?.name ||
    [customer?.firstName, customer?.lastName].filter(Boolean).join(" ") ||
    "Customer unavailable";
  const rows: PdfRow[] = [
    { text: `[ ]  Order ${order.orderNumber}`, font: "Helvetica-Bold", size: 13, color: "#29251f", gap: 0 },
    { text: `Order date: ${formatIndiaDate(order.createdAt, true)}`, font: "Helvetica", size: 9, color: "#645e55", gap: 5 },
    { text: `Customer: ${customerName}`, font: "Helvetica", size: 9, color: "#29251f", gap: 3 },
    { text: `Phone: ${customer?.phone ?? "-"}`, font: "Helvetica", size: 9, color: "#29251f", gap: 3 },
    { text: `Delivery date: ${order.deliveryDate ? formatIndiaDate(order.deliveryDate) : "Not specified"}`, font: "Helvetica", size: 9, color: "#29251f", gap: 3 },
    { text: `Delivery time slot: ${deliverySlotLabel(order, deliverySlot)}`, font: "Helvetica", size: 9, color: "#29251f", gap: 3 },
    { text: `Delivery address: ${orderAddress(order)}`, font: "Helvetica", size: 9, color: "#29251f", gap: 3 },
    { text: "Products", font: "Helvetica-Bold", size: 9, color: "#86703f", gap: 5 },
  ];

  for (const item of order.items) {
    const details = [
      `${item.quantity} x ${item.name}`,
      item.color ? `Color: ${item.color}` : undefined,
      item.unitLabel,
      `${formatRupees(item.price)} each`,
    ].filter(Boolean);
    rows.push({
      text: `- ${details.join(" | ")}`,
      font: "Helvetica",
      size: 9,
      color: "#29251f",
      gap: 2,
      indent: 10,
    });
  }

  rows.push(
    { text: `Total order amount: ${formatRupees(order.total)}`, font: "Helvetica-Bold", size: 10, color: "#29251f", gap: 6 },
    { text: `Order status: ${order.status}`, font: "Helvetica", size: 9, color: "#645e55", gap: 2 },
  );
  return rows;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminRole(request, [AdminRole.OrderManager]);
    const range = parseOrderExportRange(request.nextUrl.searchParams);
    await dbConnect();

    const logoPath = path.join(process.cwd(), "public", "assets", "images", "logo.png");
    const stream = new PassThrough();
    const doc = new PDFDocument({ size: "A4", margin: 0, compress: true });
    const filename = orderExportFilename(range);
    doc.info.Title = "FreshFlower.zone Order Export Report";
    doc.info.Author = "FreshFlower.zone";
    doc.pipe(stream);
    doc.on("error", (error: Error) => {
      console.error("Failed to generate the order export PDF.", error);
      if (!stream.destroyed) stream.destroy(error);
    });

    const generatedAt = formatIndiaDate(new Date(), true);
    let pageNumber = 1;
    let cursorY = CONTENT_START;
    let totalOrders = 0;
    let totalRevenue = 0;

    function drawHeader() {
      doc.image(logoPath, LEFT, 23, { fit: [92, 40] });
      doc.font("Helvetica-Bold").fontSize(15).fillColor("#29251f");
      doc.text("ORDER EXPORT REPORT", 154, 19, { lineBreak: false });
      doc.font("Helvetica").fontSize(9).fillColor("#645e55");
      doc.text(`FreshFlower.zone - ${range.from} to ${range.to}`, 154, 39, { lineBreak: false });
      doc.text(`Orders placed ${ORDER_EXPORT_TIME_WINDOW}`, 154, 53, { lineBreak: false });
      doc.text(`Generated ${generatedAt} IST`, 154, 67, { lineBreak: false });
      doc.moveTo(LEFT, 88).lineTo(PAGE_WIDTH - RIGHT, 88).lineWidth(0.7).strokeColor("#e7e1d7").stroke();
    }

    function drawFooter() {
      doc.moveTo(LEFT, PAGE_HEIGHT - 37).lineTo(PAGE_WIDTH - RIGHT, PAGE_HEIGHT - 37).lineWidth(0.6).strokeColor("#e7e1d7").stroke();
      doc.font("Helvetica").fontSize(8).fillColor("#81796f");
      doc.text("FreshFlower.zone · Order Export Report", LEFT, PAGE_HEIGHT - 27, { lineBreak: false });
      doc.text(`Page ${pageNumber}`, PAGE_WIDTH - RIGHT - 55, PAGE_HEIGHT - 27, {
        width: 55,
        align: "right",
        lineBreak: false,
      });
    }

    function addPage() {
      drawFooter();
      doc.addPage({ size: "A4", margin: 0 });
      pageNumber += 1;
      drawHeader();
      cursorY = CONTENT_START;
    }

    function drawRow(row: PdfRow, lines: string[]) {
      const lineHeight = row.size * 1.45;
      const rowHeight = lineHeight * lines.length;
      const gap = row.gap;
      const availableHeight = CONTENT_BOTTOM - CONTENT_START;
      if (rowHeight + gap <= availableHeight && cursorY + gap + rowHeight > CONTENT_BOTTOM) {
        addPage();
      }
      cursorY += gap;
      const x = LEFT + (row.indent ?? 0);
      const width = CONTENT_WIDTH - (row.indent ?? 0);
      for (const line of lines) {
        if (cursorY + lineHeight > CONTENT_BOTTOM) addPage();
        doc.font(row.font).fontSize(row.size).fillColor(row.color);
        doc.text(line, x, cursorY, { width, lineBreak: false });
        cursorY += lineHeight;
      }
    }

    drawHeader();
    const cursor = OrderModel.find(eligibleOrderFilter(range))
      .select({
        orderNumber: 1,
        customerId: 1,
        items: 1,
        total: 1,
        status: 1,
        createdAt: 1,
        deliveryDate: 1,
        deliverySlotId: 1,
        deliveryTimePreference: 1,
        deliveryAddress: 1,
      })
      .sort({ createdAt: 1, _id: 1 })
      .lean<ExportOrder[]>()
      .cursor();

    const streamResponse = new Response(Readable.toWeb(stream), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });

    void (async () => {
      try {
        while (true) {
          const batch: ExportOrder[] = [];
          for (let index = 0; index < BATCH_SIZE; index += 1) {
            const order = await cursor.next();
            if (!order) break;
            batch.push(order);
          }
          if (!batch.length) break;

          const customerIds = [...new Set(batch.map((order) => order.customerId))];
          const customers = customerIds.length
            ? await CustomerModel.find({ _id: { $in: customerIds } })
                .select({ name: 1, firstName: 1, lastName: 1, phone: 1 })
                .lean<ExportCustomer[]>()
            : [];
          const customersById = new Map(customers.map((customer) => [String(customer._id), customer]));
          const deliverySlotIds = [...new Set(batch.map((order) => order.deliverySlotId).filter((id): id is string => Boolean(id)))];
          const deliverySlots = deliverySlotIds.length
            ? await DeliverySlotModel.find({ _id: { $in: deliverySlotIds } })
                  .select({ label: 1, startTime: 1, endTime: 1 })
                  .lean<ExportDeliverySlot[]>()
            : [];
          const deliverySlotsById = new Map(deliverySlots.map((slot) => [String(slot._id), slot]));

          for (const order of batch) {
            const rows = orderRows(
                order,
                customersById.get(String(order.customerId)),
                deliverySlotsById.get(String(order.deliverySlotId)),
            );
            const wrapped = rows.map((row) => ({
              row,
              lines: wrapText(doc, row.text, CONTENT_WIDTH - (row.indent ?? 0), row.font, row.size),
            }));
            const estimatedHeight = wrapped.reduce(
              (height, item) => height + item.row.gap + item.lines.length * item.row.size * 1.45,
              22,
            );
            if (estimatedHeight <= CONTENT_BOTTOM - CONTENT_START && cursorY + estimatedHeight > CONTENT_BOTTOM) {
              addPage();
            }

            for (const item of wrapped) drawRow(item.row, item.lines);
            if (cursorY + 20 > CONTENT_BOTTOM) addPage();
            cursorY += 7;
            doc.moveTo(LEFT, cursorY).lineTo(PAGE_WIDTH - RIGHT, cursorY).lineWidth(0.45).strokeColor("#e7e1d7").stroke();
            cursorY += 13;
            totalOrders += 1;
            totalRevenue += order.total;
          }
        }

        const summaryHeight = 175;
        if (cursorY + summaryHeight > CONTENT_BOTTOM) addPage();
        doc.moveTo(LEFT, cursorY).lineTo(PAGE_WIDTH - RIGHT, cursorY).lineWidth(1).strokeColor("#c9a24b").stroke();
        cursorY += 16;
        doc.font("Helvetica-Bold").fontSize(13).fillColor("#29251f");
        doc.text("REPORT SUMMARY", LEFT, cursorY, { lineBreak: false });
        cursorY += 23;
        doc.font("Helvetica").fontSize(10).fillColor("#29251f");
        doc.text(`Total eligible orders: ${totalOrders}`, LEFT, cursorY, { lineBreak: false });
        cursorY += 17;
        doc.text(`Total revenue: ${formatRupees(totalRevenue)}`, LEFT, cursorY, { lineBreak: false });
        cursorY += 17;
        doc.text(`Selected date range: ${range.from} to ${range.to}`, LEFT, cursorY, { lineBreak: false });
        cursorY += 17;
        doc.text(`Order time window: ${ORDER_EXPORT_TIME_WINDOW}`, LEFT, cursorY, { lineBreak: false });
        cursorY += 22;
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#645e55");
        doc.text("Manual verification / notes", LEFT, cursorY, { lineBreak: false });
        cursorY += 8;
        doc.roundedRect(LEFT, cursorY, CONTENT_WIDTH, 43, 3).lineWidth(0.7).strokeColor("#d8d1c5").stroke();

        drawFooter();
        doc.end();
      } catch (error) {
        doc.destroy(error instanceof Error ? error : new Error("Order export PDF generation failed."));
      } finally {
        try {
          await cursor.close();
        } catch (error) {
          console.error("Could not close the read-only order export cursor.", error);
          if (!stream.destroyed) {
            stream.destroy(error instanceof Error ? error : new Error("Order export cursor close failed."));
          }
        }
      }
    })();

    return streamResponse;
  } catch (error) {
    return safe(async () => {
      throw error;
    });
  }
}
