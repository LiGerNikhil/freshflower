import { PassThrough, Readable } from "node:stream";
import path from "node:path";
import PDFDocument from "pdfkit";
import { NextRequest } from "next/server";
import { OrderModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { requireAdminRole } from "@/lib/admin/authorization";
import { parseDeliveryDateExportRange } from "@/lib/admin/order-export";
import { ApiError, safe } from "@/lib/api/helpers";
import {
  getLiveFestivalCollectionBySlug,
  getPublishedFlowers,
} from "@/lib/db/repositories";
import { AdminRole, type Flower } from "@/lib/types";

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
  items: Array<{
    productId: string;
    name: string;
    color?: string;
    quantity: number;
  }>;
  deliveryDate: Date;
};

type DeliveryProductQuantity = {
  _id: { productId: string; color: string };
  totalQuantity: number;
};

type DeliveryProductInfo = {
  name: string;
  colors: Map<string, string>;
};

type ProductQuantity = {
  name: string;
  color: string;
  totalQuantity: number;
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

function formatIndiaDate(value: Date | string, includeTime = false): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit", hour12: true } : {}),
  }).format(new Date(value));
}

function formatRangeDay(value: string): string {
  return formatIndiaDate(`${value}T12:00:00.000Z`);
}

function formatDeliveryRange(from: string, to: string): string {
  return from === to
    ? formatRangeDay(from)
    : `${formatRangeDay(from)} to ${formatRangeDay(to)}`;
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

function exportFilename(from: string, to: string): string {
  return `FreshFlower_Delivery_Orders_${from}_to_${to}.pdf`;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminRole(request, [AdminRole.OrderManager]);
    const range = parseDeliveryDateExportRange(request.nextUrl.searchParams);
    await dbConnect();

    const campaign = await getLiveFestivalCollectionBySlug("diwali");
    if (!campaign?.advanceBooking) {
      throw new ApiError("The Diwali product list is not available.", 409);
    }

    const productSettings = new Map(
      campaign.advanceBooking.productSettings.map((setting) => [setting.productId, setting]),
    );
    const listedProductIds = [...new Set(campaign.productIds)].filter(
      (productId) => productSettings.get(productId)?.visible !== false,
    );
    const allFlowers = await getPublishedFlowers();
    const flowersById = new Map(allFlowers.map((flower) => [flower.id, flower]));
    const listedProducts = listedProductIds
      .map((productId) => flowersById.get(productId))
      .filter(
        (flower): flower is Flower =>
          Boolean(flower?.inStock && flower.stockStatus !== "sold-out"),
      );
    const productInfoById = new Map<string, DeliveryProductInfo>(
      listedProducts.map((product) => {
        const productId = product.id;
        const displayLabel = productSettings.get(productId)?.displayLabel?.trim();
        return [
          productId,
          {
            name: displayLabel || product.name,
            colors: new Map(
              (product.colorVariants ?? []).map((variant) => [
                variant.color.trim().toLocaleLowerCase(),
                variant.color.trim(),
              ]),
            ),
          },
        ];
      }),
    );
    const diwaliProductIds = [...productInfoById.keys()];
    const paidOrderFilter = {
      ...range.filter,
      paymentStatus: "paid",
      items: { $elemMatch: { productId: { $in: diwaliProductIds } } },
    };
    const [productTotals, orderCount] = await Promise.all([
      OrderModel.aggregate<DeliveryProductQuantity>([
        { $match: paidOrderFilter },
        { $unwind: "$items" },
        { $match: { "items.productId": { $in: diwaliProductIds } } },
        {
          $group: {
            _id: {
              productId: "$items.productId",
              color: { $ifNull: ["$items.color", ""] },
            },
            totalQuantity: { $sum: "$items.quantity" },
          },
        },
        { $sort: { "_id.productId": 1, "_id.color": 1 } },
      ]).exec(),
      OrderModel.countDocuments(paidOrderFilter).exec(),
    ]);

    const productTotalsByNameAndColor = new Map<string, ProductQuantity>();
    for (const total of productTotals) {
      const productInfo = productInfoById.get(total._id.productId);
      if (!productInfo) continue;

      const savedColor = total._id.color.trim();
      const color =
        productInfo.colors.get(savedColor.toLocaleLowerCase()) ?? savedColor;
      const key = JSON.stringify([
        productInfo.name.toLocaleLowerCase(),
        color.toLocaleLowerCase(),
      ]);
      const existing = productTotalsByNameAndColor.get(key);
      if (existing) {
        existing.totalQuantity += total.totalQuantity;
      } else {
        productTotalsByNameAndColor.set(key, {
          name: productInfo.name,
          color,
          totalQuantity: total.totalQuantity,
        });
      }
    }
    const productSummary = [...productTotalsByNameAndColor.values()].sort(
      (first, second) =>
        first.name.localeCompare(second.name, "en") ||
        first.color.localeCompare(second.color, "en"),
    );

    const logoPath = path.join(process.cwd(), "public", "assets", "images", "logo.png");
    const stream = new PassThrough();
    const doc = new PDFDocument({ size: "A4", margin: 0, compress: true });
    const filename = exportFilename(range.from, range.to);
    doc.info.Title = "FreshFlower.zone Diwali Delivery Plan";
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
      doc.text("DIWALI DELIVERY PLAN", 154, 19, { lineBreak: false });
      doc.font("Helvetica").fontSize(9).fillColor("#645e55");
      doc.text(`Delivery date: ${formatDeliveryRange(range.from, range.to)}`, 154, 39, {
        lineBreak: false,
      });
      doc.text("Full day: 12 AM to next 12 AM IST | Paid orders only", 154, 53, {
        lineBreak: false,
      });
      doc.text(`Made ${generatedAt} IST`, 154, 67, { lineBreak: false });
      doc.moveTo(LEFT, 88).lineTo(PAGE_WIDTH - RIGHT, 88).lineWidth(0.7).strokeColor("#e7e1d7").stroke();
    }

    function drawFooter() {
      doc.moveTo(LEFT, PAGE_HEIGHT - 37)
        .lineTo(PAGE_WIDTH - RIGHT, PAGE_HEIGHT - 37)
        .lineWidth(0.6)
        .strokeColor("#e7e1d7")
        .stroke();
      doc.font("Helvetica").fontSize(8).fillColor("#81796f");
      doc.text("FreshFlower.zone - Diwali Delivery Plan", LEFT, PAGE_HEIGHT - 27, {
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
      doc.text(continued ? "PRODUCTS TO PREPARE (CONTINUED)" : "PRODUCTS TO PREPARE", LEFT, cursorY, {
        lineBreak: false,
      });
      cursorY += 16;
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#86703f");
      doc.text("PRODUCT", LEFT, cursorY, { lineBreak: false });
      doc.text("COLOR", LEFT + CONTENT_WIDTH - 145, cursorY, { lineBreak: false });
      doc.text("QTY NEEDED", PAGE_WIDTH - RIGHT - 58, cursorY, {
        width: 58,
        align: "right",
        lineBreak: false,
      });
      cursorY += 7;
      doc.moveTo(LEFT, cursorY).lineTo(PAGE_WIDTH - RIGHT, cursorY).lineWidth(0.6).strokeColor("#d8d1c5").stroke();
      cursorY += 7;
    }

    drawHeader();
    drawTableHeader();
    if (productSummary.length === 0) {
      doc.font("Helvetica").fontSize(9).fillColor("#645e55");
      doc.text("No matching product quantities for these dates.", LEFT, cursorY, {
        width: CONTENT_WIDTH,
      });
      cursorY += 24;
    } else {
      for (const product of productSummary) {
        const productLines = wrapText(doc, product.name, CONTENT_WIDTH - 175, "Helvetica", 8.5);
        const colorLines = wrapText(
          doc,
          product.color || "No color",
          82,
          "Helvetica",
          8.5,
        );
        const rowHeight = Math.max(
          13,
          productLines.length * 11,
          colorLines.length * 11,
        );
        if (cursorY + rowHeight > CONTENT_BOTTOM) {
          addPage();
          drawTableHeader(true);
        }
        doc.font("Helvetica").fontSize(8.5).fillColor("#29251f");
        productLines.forEach((line, index) => {
          doc.text(line, LEFT, cursorY + index * 11, { lineBreak: false });
        });
        colorLines.forEach((line, index) => {
          doc.text(line, LEFT + CONTENT_WIDTH - 145, cursorY + index * 11, {
            lineBreak: false,
          });
        });
        doc.text(String(product.totalQuantity), PAGE_WIDTH - RIGHT - 58, cursorY, {
          width: 58,
          align: "right",
          lineBreak: false,
        });
        cursorY += rowHeight;
        doc.moveTo(LEFT, cursorY).lineTo(PAGE_WIDTH - RIGHT, cursorY).lineWidth(0.35).strokeColor("#eee9e0").stroke();
        cursorY += 5;
      }
    }

    addPage();
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#29251f");
    doc.text("ORDER QUANTITIES", LEFT, cursorY, { lineBreak: false });
    cursorY += 22;

    const cursor = OrderModel.find(paidOrderFilter)
      .select({
        orderNumber: 1,
        items: 1,
        deliveryDate: 1,
      })
      .sort({ deliveryDate: 1, orderNumber: 1, _id: 1 })
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
        if (orderCount === 0) {
          doc.font("Helvetica").fontSize(9).fillColor("#645e55");
          doc.text("No matching orders for these dates.", LEFT, cursorY, {
            width: CONTENT_WIDTH,
          });
        }

        while (true) {
          const batch: DeliveryOrder[] = [];
          for (let index = 0; index < BATCH_SIZE; index += 1) {
            const order = await cursor.next();
            if (!order) break;
            batch.push(order);
          }
          if (!batch.length) break;

          for (const order of batch) {
            const orderItems = order.items.filter((item) =>
              productInfoById.has(String(item.productId)),
            );
            if (!orderItems.length) continue;

            const orderQuantities = new Map<
              string,
              { name: string; color: string; quantity: number }
            >();
            for (const item of orderItems) {
              const productInfo = productInfoById.get(String(item.productId));
              if (!productInfo) continue;

              const savedColor = item.color?.trim() ?? "";
              const color =
                productInfo.colors.get(savedColor.toLocaleLowerCase()) ?? savedColor;
              const key = JSON.stringify([
                productInfo.name.toLocaleLowerCase(),
                color.toLocaleLowerCase(),
              ]);
              const existing = orderQuantities.get(key);
              if (existing) {
                existing.quantity += item.quantity;
              } else {
                orderQuantities.set(key, {
                  name: productInfo.name,
                  color,
                  quantity: item.quantity,
                });
              }
            }

            const rows: Array<{ text: string; style: TextStyle }> = [
              {
                text: `Order ${order.orderNumber}  |  Delivery: ${formatIndiaDate(order.deliveryDate)}`,
                style: { font: "Helvetica-Bold", size: 10, color: "#29251f", gapAfter: 4 },
              },
              ...[...orderQuantities.values()].map((item) => ({
                  text: `${item.quantity} x ${item.name}${item.color ? ` | Color: ${item.color}` : ""}`,
                  style: {
                    font: "Helvetica" as const,
                    size: 9,
                    color: "#29251f",
                    gapAfter: 3,
                    indent: 8,
                  },
                })),
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
