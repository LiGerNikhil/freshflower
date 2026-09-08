import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/ContentPages";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Refund & cancellation policy | FreshFlower.zone",
  description:
    "Refund and cancellation terms for FreshFlower.zone flower orders, including quality concerns and event orders.",
  alternates: { canonical: canonical("/refund-policy") },
  openGraph: {
    title: "Refund & cancellation policy | FreshFlower.zone",
    description:
      "Refund and cancellation terms for FreshFlower.zone flower orders, including quality concerns and event orders.",
    url: canonical("/refund-policy"),
    type: "website",
  },
};

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund & cancellation policy">
      <h2>1. General principle</h2>
      <p>
        Fresh flowers are time-sensitive, perishable products. Because flowers
        are sourced and prepared specifically for your delivery date,
        cancellation and refund options depend on how far the order has
        progressed. We are committed to fair resolution in every case.
      </p>

      <h2>2. Cancellation before preparation</h2>
      <p>
        If you cancel your order before it has entered preparation or
        dispatch, we will process a full refund to the original payment method
        within 5–7 business days. For same-day orders, please contact us
        immediately — our preparation window is typically 1–2 hours after
        confirmation.
      </p>

      <h2>3. Cancellation after preparation</h2>
      <p>
        Once flowers have been prepared, arranged, or dispatched for delivery,
        cancellation is no longer possible. If you need to reschedule rather
        than cancel, contact us and we will do our best to accommodate a
        different delivery date, subject to availability.
      </p>

      <h2>4. Same-day order cancellation</h2>
      <p>
        Same-day orders have a shorter cancellation window due to the
        expedited preparation and delivery process. Please call us directly at{" "}
        <strong>+91 99999 99999</strong> for the fastest assistance. If the
        order has not yet been prepared, we will cancel and refund.
      </p>

      <h2>5. Quality concerns</h2>
      <p>
        If your order arrives damaged, wilted, or materially different from
        what was confirmed, please contact us with photographs within{" "}
        <strong>24 hours of delivery</strong>. We will review the issue and,
        at our discretion, may offer:
      </p>
      <ul>
        <li>A replacement delivery of equivalent flowers</li>
        <li>A credit note for future orders</li>
        <li>A partial or full refund</li>
      </ul>
      <p>
        Quality claims received after 24 hours may not be eligible for
        resolution, as flower condition can change due to handling and care
        after delivery.
      </p>

      <h2>6. Refund method and timeline</h2>
      <p>
        Approved refunds are processed to the original payment method. UPI and
        card refunds typically reflect within 5–7 business days. Cash-on-
        delivery refunds are issued via UPI transfer or store credit, at your
        preference.
      </p>

      <h2>7. Wholesale and bulk orders</h2>
      <p>
        Custom event work, bulk orders, and flowers specially sourced for a
        specific date may have separate cancellation terms agreed upon in the
        written quote. Please review your quote document for the applicable
        terms.
      </p>

      <h2>8. Wedding and event orders</h2>
      <p>
        Wedding and event floral orders are subject to the cancellation terms
        outlined in the individual event contract or quote. A non-refundable
        advance may apply to secure sourcing and reservation of specific flower
        varieties.
      </p>

      <h2>9. Non-refundable items</h2>
      <p>
        The following are generally not eligible for refunds:
      </p>
      <ul>
        <li>
          Orders cancelled after preparation or dispatch has begun
        </li>
        <li>
          Minor natural variations in flower colour, size, or bloom stage
        </li>
        <li>
          Deliveries where the customer was unavailable and the order was
          returned or disposed of by the delivery partner
        </li>
      </ul>

      <h2>10. Dispute resolution</h2>
      <p>
        If you are dissatisfied with a refund decision, please contact us at{" "}
        <strong>hello@freshflower.zone</strong> with your order number and
        details. We will review the matter promptly and aim to reach a fair
        resolution.
      </p>

      <h2>11. Contact</h2>
      <p>
        For refund or cancellation requests, reach us at{" "}
        <strong>hello@freshflower.zone</strong> or call{" "}
        <strong>+91 99999 99999</strong> during business hours.
      </p>
    </LegalPage>
  );
}
