import { PassThrough, Readable } from "node:stream";
import path from "node:path";
import PDFDocument from "pdfkit";
import { NextRequest } from "next/server";
import { CustomerModel, DeliverySlotModel, OrderModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { requireAdminRole } from "@/lib/admin/authorization";
import { parseDeliveryDateExportRange } from "@/lib/admin/order-export";
import { safe } from "@/lib/api/helpers";
import { AdminRole } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const LEFT = 44;
const RIGHT = 44;
const CONTENT_WIDTH = PAGE_WIDTH - LEFT - RIGHT;
const CONTENT_START = 108;
const CONTENT_BOTTOM = PAGE_HEIGHT - 54;
const BATCH_SIZE = 100;

type DeliveryOrder = {
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
  paymentStatus?: string;
  createdAt: Date;
  deliveryDate: Date;
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

type DeliveryCustomer = {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

type DeliverySlot = {
  _id: string;
  label?: string;
  startTime?: string;
  endTime?: string;
};

type DeliverySummary = {
  overview: Array<{ totalOrders: number; totalRevenue: number }>;
  products: Array<{
    _id: {
      productId: string;
      name: string;
      color: string;
      unitLabel: string;
      productType: string;
    };
    totalQuantity: number;
    orderCount: number;
  }>;
};

type TextStyle = {
  font: "Helvetica" | "Helvetica-Bold";
  size: number;
  color: string;
  gapAfter?: number;
  indent?: number;
};

function pdfSafeText(value: string): string {
  return value
    .replace(/[₹]/g, "INR ")
    .replace(/[×]/g, "x")
    .replace(/[•·]/g, "-")
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\xFF]/g, "?");
}

function formatRupees(amount: number): string {
  return `INR ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(amount)}`;
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

function formatDeliveryDate(value: Date): string {
  const date = new Date(value);
  if (date.getUTCHours() === 18 && date.getUTCMinutes() === 30) {
    return formatIndiaDate(date);
  }
  return date.toISOString().slice(0, 10);
}

function wrapText(
  doc: PDFKit.PDFDocument,
  text: string,
  width: number,
  font: TextStyle["font"],
  size: number,
): string[] {
  doc.font(font).fontSize(size);
  const lines: string[] = [];
  let line = "";
  for (const word of pdfSafeText(text).split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (!line || doc.widthOfString(candidate) <= width) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function customerName(customer?: DeliveryCustomer): string {
  return (
    customer?.name ||
    [customer?.firstName, customer?.lastName].filter(Boolean).join(" ") ||
    "Customer unavailable"
  );
}

function deliverySlotLabel(order: DeliveryOrder, slot?: DeliverySlot): string {
  return (
    order.deliveryTimePreference ||
    slot?.label ||
    [slot?.startTime, slot?.endTime].filter(Boolean).join(" - ") ||
    order.deliverySlotId ||
    "Not specified"
  );
}

function deliveryAddress(order: DeliveryOrder): string {
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

function exportFilename(from: string, to: string): string {
  return `FreshFlower_Delivery_Orders_${from}_to_${to}.pdf`;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminRole(request, [AdminRole.OrderManager]);
    const range = parseDeliveryDateExportRange(request.nextUrl.searchParams);
    await dbConnect();

    const paidOrderFilter = { ...range.filter, paymentStatus: "paid" };
    const [summary] = await OrderModel.aggregate<DeliverySummary>([
      { $match: paidOrderFilter },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: "$total" },
              },
            },
            { $project: { _id: 0, totalOrders: 1, totalRevenue: 1 } },
          ],
          products: [
            { $unwind: "$items" },
            {
              $group: {
                _id: {
                  orderId: "$_id",
                  productId: "$items.productId",
                  name: "$items.name",
                  color: { $ifNull: ["$items.color", ""] },
                  unitLabel: { $ifNull: ["$items.unitLabel", ""] },
                  productType: { $ifNull: ["$items.productType", ""] },
                },
                totalQuantity: { $sum: "$items.quantity" },
              },
            },
            {
              $group: {
                _id: {
                  productId: "$_id.productId",
                  name: "$_id.name",
                  color: "$_id.color",
                  unitLabel: "$_id.unitLabel",
                  productType: "$_id.productType",
                },
                totalQuantity: { $sum: "$totalQuantity" },
                orderCount: { $sum: 1 },
              },
            },
            { $sort: { "_id.name": 1, "_id.color": 1, "_id.unitLabel": 1, "_id.productId": 1 } },
          ],
        },
      },
    ]).exec();
    const overview = summary?.overview[0] ?? { totalOrders: 0, totalRevenue: 0 };
    const productSummary = summary?.products ?? [];
    const totalItemQuantity = productSummary.reduce((total, product) => total + product.totalQuantity, 0);

    const logoPath = path.join(process.cwd(), "public", "assets", "images", "logo.png");
    const stream = new PassThrough();
    const doc = new PDFDocument({ size: "A4", margin: 0, compress: true });
    const filename = exportFilename(range.from, range.to);
    doc.info.Title = "FreshFlower.zone Delivery Date Stock Report";
    doc.info.Author = "FreshFlower.zone";
    doc.pipe(stream);
    doc.on("error", (error: Error) => {
      console.error("Failed to generate the delivery-date PDF.", error);
      if (!stream.destroyed) stream.destroy(error);
    });

    const generatedAt = formatIndiaDate(new Date(), true);
    let pageNumber = 1;
    let cursorY = CONTENT_START;

    function drawHeader() {
      doc.image(logoPath, LEFT, 23, { fit: [92, 40] });
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#29251f");
      doc.text("DELIVERY DATE STOCK REPORT", 154, 19, { lineBreak: false });
      doc.font("Helvetica").fontSize(9).fillColor("#645e55");
      doc.text(`Delivery dates: ${range.from} to ${range.to}`, 154, 39, { lineBreak: false });
      doc.text("Customer-selected delivery dates", 154, 53, { lineBreak: false });
      doc.text(`Generated ${generatedAt} IST`, 154, 67, { lineBreak: false });
      doc.moveTo(LEFT, 88).lineTo(PAGE_WIDTH - RIGHT, 88).lineWidth(0.7).strokeColor("#e7e1d7").stroke();
    }

    function drawFooter() {
      doc.moveTo(LEFT, PAGE_HEIGHT - 37)
        .lineTo(PAGE_WIDTH - RIGHT, PAGE_HEIGHT - 37)
        .lineWidth(0.6)
        .strokeColor("#e7e1d7")
        .stroke();
      doc.font("Helvetica").fontSize(8).fillColor("#81796f");
      doc.text("FreshFlower.zone - Delivery Date Stock Report", LEFT, PAGE_HEIGHT - 27, {
        lineBreak: false,
      });
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

    function drawTableHeader(continued = false) {
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#645e55");
      doc.text(continued ? "PRODUCT STOCK REQUIREMENT (CONTINUED)" : "PRODUCT STOCK REQUIREMENT", LEFT, cursorY, {
        lineBreak: false,
      });
      cursorY += 14;
      doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#29251f");
      doc.text("BUY/PREPARE TOTAL QTY ONLY. DO NOT MULTIPLY BY ORDERS.", LEFT, cursorY, {
        lineBreak: false,
      });
      cursorY += 11;
      doc.font("Helvetica").fontSize(7).fillColor("#645e55");
      doc.text(
        "TOTAL QTY = combined product units customers ordered; prepare this number only. Do not multiply by ORDERS.",
        LEFT,
        cursorY,
        { lineBreak: false },
      );
      cursorY += 12;
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#86703f");
      doc.text("PRODUCT / VARIANT", LEFT, cursorY, { lineBreak: false });
      doc.text("TOTAL QTY", PAGE_WIDTH - RIGHT - 116, cursorY, { width: 65, align: "right", lineBreak: false });
      doc.text("ORDERS", PAGE_WIDTH - RIGHT - 44, cursorY, { width: 44, align: "right", lineBreak: false });
      cursorY += 7;
      doc.moveTo(LEFT, cursorY).lineTo(PAGE_WIDTH - RIGHT, cursorY).lineWidth(0.6).strokeColor("#d8d1c5").stroke();
      cursorY += 7;
    }

    drawHeader();
    doc.roundedRect(LEFT, cursorY, CONTENT_WIDTH, 78, 8).fill("#f8f3e8");
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#86703f");
    doc.text("PAID ORDERS ONLY - STOCK REQUIREMENT", LEFT + 12, cursorY + 10, { lineBreak: false });
    doc.moveTo(LEFT + 12, cursorY + 27)
      .lineTo(PAGE_WIDTH - RIGHT - 12, cursorY + 27)
      .lineWidth(0.5)
      .strokeColor("#e2d7c2")
      .stroke();

    const metricColumns = [
      { label: "PAID ORDERS", value: String(overview.totalOrders) },
      { label: "TOTAL QTY TO PREPARE", value: String(totalItemQuantity) },
      { label: "PAID ORDER VALUE", value: formatRupees(overview.totalRevenue) },
    ];
    const metricWidth = (CONTENT_WIDTH - 24) / metricColumns.length;
    metricColumns.forEach((metric, index) => {
      const x = LEFT + 12 + metricWidth * index;
      doc.font("Helvetica").fontSize(7).fillColor("#645e55");
      doc.text(metric.label, x, cursorY + 36, { width: metricWidth - 8, lineBreak: false });
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#29251f");
      doc.text(metric.value, x, cursorY + 49, { width: metricWidth - 8, lineBreak: false });
    });
    cursorY += 92;

    drawTableHeader();
    if (productSummary.length === 0) {
      doc.font("Helvetica").fontSize(9).fillColor("#645e55");
      doc.text("No paid product quantities found for these delivery dates.", LEFT, cursorY, {
        width: CONTENT_WIDTH,
      });
      cursorY += 24;
    } else {
      for (const product of productSummary) {
        const productName = product._id.name || "Unnamed product";
        const labelParts = [
          productName,
          product._id.color ? `Color: ${product._id.color}` : undefined,
          product._id.unitLabel &&
          !productName.toLocaleLowerCase().includes(product._id.unitLabel.toLocaleLowerCase())
            ? `Pack/size: ${product._id.unitLabel}`
            : undefined,
        ].filter(Boolean);
        const lines = wrapText(doc, labelParts.join(" | "), CONTENT_WIDTH - 175, "Helvetica", 8.5);
        const rowHeight = Math.max(13, lines.length * 11);
        if (cursorY + rowHeight > CONTENT_BOTTOM) {
          addPage();
          drawTableHeader(true);
        }
        doc.font("Helvetica").fontSize(8.5).fillColor("#29251f");
        lines.forEach((line, index) => {
          doc.text(line, LEFT, cursorY + index * 11, { lineBreak: false });
        });
        doc.text(String(product.totalQuantity), PAGE_WIDTH - RIGHT - 116, cursorY, {
          width: 65,
          align: "right",
          lineBreak: false,
        });
        doc.text(String(product.orderCount), PAGE_WIDTH - RIGHT - 44, cursorY, {
          width: 44,
          align: "right",
          lineBreak: false,
        });
        cursorY += rowHeight;
        doc.moveTo(LEFT, cursorY).lineTo(PAGE_WIDTH - RIGHT, cursorY).lineWidth(0.35).strokeColor("#eee9e0").stroke();
        cursorY += 5;
      }
    }

    doc.font("Helvetica").fontSize(8).fillColor("#645e55");
    doc.text(
      "Quantities are summed from paid orders' saved item quantities, grouped by product, color, and pack/size.",
      LEFT,
      cursorY + 4,
      { width: CONTENT_WIDTH },
    );

    addPage();
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#29251f");
    doc.text("ORDER DETAILS", LEFT, cursorY, { lineBreak: false });
    cursorY += 22;

    const cursor = OrderModel.find(paidOrderFilter)
      .select({
        orderNumber: 1,
        customerId: 1,
        items: 1,
        total: 1,
        status: 1,
        paymentStatus: 1,
        createdAt: 1,
        deliveryDate: 1,
        deliverySlotId: 1,
        deliveryTimePreference: 1,
        deliveryAddress: 1,
      })
      .sort({ deliveryDate: 1, createdAt: 1, _id: 1 })
      .lean<DeliveryOrder[]>()
      .cursor();

    const response = new Response(Readable.toWeb(stream), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });

    void (async () => {
      try {
        while (true) {
          const batch: DeliveryOrder[] = [];
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
                .lean<DeliveryCustomer[]>()
            : [];
          const customersById = new Map(customers.map((customer) => [String(customer._id), customer]));
          const slotIds = [...new Set(batch.map((order) => order.deliverySlotId).filter((id): id is string => Boolean(id)))];
          const slots = slotIds.length
            ? await DeliverySlotModel.find({ _id: { $in: slotIds } })
                .select({ label: 1, startTime: 1, endTime: 1 })
                .lean<DeliverySlot[]>()
            : [];
          const slotsById = new Map(slots.map((slot) => [String(slot._id), slot]));

          for (const order of batch) {
            const customer = customersById.get(String(order.customerId));
            const slot = slotsById.get(String(order.deliverySlotId));
            const rows: Array<{ text: string; style: TextStyle }> = [
              {
                text: `[ ]  Order ${order.orderNumber}`,
                style: { font: "Helvetica-Bold", size: 12, color: "#29251f", gapAfter: 5 },
              },
              {
                text: `Delivery: ${formatDeliveryDate(order.deliveryDate)} | Slot: ${deliverySlotLabel(order, slot)}`,
                style: { font: "Helvetica", size: 9, color: "#29251f", gapAfter: 3 },
              },
              {
                text: `Customer: ${customerName(customer)} | Phone: ${customer?.phone ?? "-"}`,
                style: { font: "Helvetica", size: 9, color: "#29251f", gapAfter: 3 },
              },
              {
                text: `Address: ${deliveryAddress(order)}`,
                style: { font: "Helvetica", size: 9, color: "#29251f", gapAfter: 3 },
              },
              {
                text: `Placed: ${formatIndiaDate(order.createdAt, true)} | Status: ${order.status} | Payment: ${order.paymentStatus ?? "not specified"}`,
                style: { font: "Helvetica", size: 8.5, color: "#645e55", gapAfter: 5 },
              },
              {
                text: "ITEMS",
                style: { font: "Helvetica-Bold", size: 8.5, color: "#86703f", gapAfter: 2 },
              },
              ...order.items.map((item) => ({
                text: `- ${item.quantity} x ${item.name}${item.color ? ` | Color: ${item.color}` : ""}${item.unitLabel ? ` | ${item.unitLabel}` : ""} | ${formatRupees(item.price)} each`,
                style: { font: "Helvetica" as const, size: 8.5, color: "#29251f", gapAfter: 2, indent: 8 },
              })),
              {
                text: `Order total: ${formatRupees(order.total)}`,
                style: { font: "Helvetica-Bold", size: 9, color: "#29251f", gapAfter: 5 },
              },
            ];
            const wrapped = rows.map(({ text, style }) => ({
              style,
              lines: wrapText(doc, text, CONTENT_WIDTH - (style.indent ?? 0), style.font, style.size),
            }));
            const estimatedHeight = wrapped.reduce(
              (height, row) => height + row.lines.length * row.style.size * 1.4 + (row.style.gapAfter ?? 0),
              16,
            );
            if (estimatedHeight < CONTENT_BOTTOM - CONTENT_START && cursorY + estimatedHeight > CONTENT_BOTTOM) {
              addPage();
            }

            for (const row of wrapped) {
              const lineHeight = row.style.size * 1.4;
              for (const line of row.lines) {
                if (cursorY + lineHeight > CONTENT_BOTTOM) addPage();
                doc.font(row.style.font).fontSize(row.style.size).fillColor(row.style.color);
                doc.text(line, LEFT + (row.style.indent ?? 0), cursorY, {
                  lineBreak: false,
                  width: CONTENT_WIDTH - (row.style.indent ?? 0),
                });
                cursorY += lineHeight;
              }
              cursorY += row.style.gapAfter ?? 0;
            }
            cursorY += 3;
            doc.moveTo(LEFT, cursorY)
              .lineTo(PAGE_WIDTH - RIGHT, cursorY)
              .lineWidth(0.45)
              .strokeColor("#e7e1d7")
              .stroke();
            cursorY += 12;
          }
        }

        drawFooter();
        doc.end();
      } catch (error) {
        doc.destroy(error instanceof Error ? error : new Error("Delivery-date PDF generation failed."));
      } finally {
        try {
          await cursor.close();
        } catch (error) {
          console.error("Could not close the read-only delivery-date order cursor.", error);
          if (!stream.destroyed) {
            stream.destroy(error instanceof Error ? error : new Error("Delivery-date order cursor close failed."));
          }
        }
      }
    })();

    return response;
  } catch (error) {
    return safe(async () => {
      throw error;
    });
  }
}
