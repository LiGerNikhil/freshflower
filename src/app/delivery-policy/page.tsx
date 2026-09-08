import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/ContentPages";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Delivery policy | FreshFlower.zone",
  description:
    "FreshFlower.zone delivery areas, time slots, Porter charges, same-day rules, and order cutoff times for Delhi NCR.",
  alternates: { canonical: canonical("/delivery-policy") },
  openGraph: {
    title: "Delivery policy | FreshFlower.zone",
    description:
      "FreshFlower.zone delivery areas, time slots, Porter charges, same-day rules, and order cutoff times for Delhi NCR.",
    url: canonical("/delivery-policy"),
    type: "website",
  },
};

export default function DeliveryPolicyPage() {
  return (
    <LegalPage title="Delivery policy">
      <h2>1. Service areas</h2>
      <p>
        FreshFlower.zone currently delivers to selected areas within Delhi NCR,
        including South Extension, Connaught Place, Vasant Kunj, Gurgaon (DLF
        Phase 1–5), Noida (Sector 15–62), and Dwarka. We are continuously
        expanding our delivery footprint. If your area is not listed, please
        contact us and we will try to accommodate your order.
      </p>

      <h2>2. Delivery time slots</h2>
      <p>
        We offer morning delivery windows from 5 AM to 12 PM. Early windows
        (5 AM – 7 AM) are designated as &ldquo;Morning Express&rdquo; when
        available. Time slots are selected at checkout and are subject to
        availability in your area on the chosen date.
      </p>

      <h2>3. Same-day delivery</h2>
      <p>
        Same-day delivery is available for orders placed before the available
        slots fill up. Availability depends on the flower variety, your
        delivery area, the date, and remaining slot capacity. We recommend
        ordering as early as possible for same-day delivery.
      </p>

      <h2>4. Order cutoff times</h2>
      <p>
        For same-day morning delivery, order before the available slots are
        full. For next-day delivery, you may book up to the evening before.
        Large orders, weddings, and corporate requirements should be placed at
        least 3–5 business days in advance.
      </p>

      <h2>5. Porter delivery charges</h2>
      <p>
        We use Porter (and similar last-mile delivery partners) for order
        handoff. Porter charges are <strong>payable by the customer directly
        to the delivery rider</strong> at the time of delivery. These charges
        are separate from the flower order total and may vary based on:
      </p>
      <ul>
        <li>Distance between our preparation point and the delivery address</li>
        <li>Time of day and demand conditions</li>
        <li>Vehicle type required for the delivery</li>
        <li>Traffic and route conditions</li>
      </ul>
      <p>
        The estimated Porter charge range for your order will be communicated
        where possible during the ordering process.
      </p>

      <h2>6. Receiving your delivery</h2>
      <p>
        Please provide a complete and accurate delivery address, a reachable
        phone number, and any helpful delivery instructions (landmark, floor,
        gate code, etc.). If no one is available at the delivery address, our
        rider may contact you to coordinate a safe handoff. Failed delivery
        attempts due to customer unavailability may not be eligible for a
        refund.
      </p>

      <h2>7. Delivery timing and delays</h2>
      <p>
        Delivery time slots are estimates. Actual delivery may be affected by
        weather, traffic congestion, road restrictions, building access rules,
        or delivery partner availability. We will communicate any material
        delays using the contact details provided with your order.
      </p>

      <h2>8. Multi-drop and bulk deliveries</h2>
      <p>
        For wholesale, corporate, or event deliveries requiring multiple drops
        or coordinated timing, please contact us directly so we can plan the
        route and timing appropriately. Special arrangements may apply.
      </p>

      <h2>9. Delivery during festivals and peak seasons</h2>
      <p>
        During major festivals (Diwali, Valentine&apos;s Day, Mother&apos;s
        Day, Christmas) and peak wedding season, delivery slots may fill up
        faster than usual. We recommend placing orders well in advance to
        secure your preferred time slot.
      </p>

      <h2>10. Contact for delivery queries</h2>
      <p>
        For delivery-related questions, reach us at{" "}
        <strong>hello@freshflower.zone</strong> or call{" "}
        <strong>+91 99999 99999</strong> during business hours (Mon–Sat
        6 AM–8 PM, Sun 7 AM–2 PM).
      </p>
    </LegalPage>
  );
}
