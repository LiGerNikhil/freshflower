import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/ContentPages";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of service | FreshFlower.zone",
  description:
    "Terms and conditions governing the use of FreshFlower.zone's website, ordering services, and flower delivery.",
  alternates: { canonical: canonical("/terms") },
  openGraph: {
    title: "Terms of service | FreshFlower.zone",
    description:
      "Terms and conditions governing the use of FreshFlower.zone's website, ordering services, and flower delivery.",
    url: canonical("/terms"),
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service">
      <h2>1. Acceptance of terms</h2>
      <p>
        By accessing or using the FreshFlower.zone website and services, you
        agree to be bound by these Terms of Service. If you do not agree to
        these terms, please do not use our website or services.
      </p>

      <h2>2. Description of services</h2>
      <p>
        FreshFlower.zone provides an online platform for ordering fresh flowers,
        bouquets, and related products for delivery across selected areas of
        Delhi NCR. We also offer wholesale enquiries, wedding and event
        consultations, and corporate floral solutions.
      </p>

      <h2>3. Orders and acceptance</h2>
      <p>
        Placing an order on our website constitutes an offer to purchase. An
        order is confirmed only when you receive an order confirmation via
        WhatsApp, SMS, or email. We reserve the right to refuse or cancel
        orders in cases of pricing errors, product unavailability, suspected
        fraud, or delivery area restrictions.
      </p>

      <h2>4. Pricing and payment</h2>
      <p>
        All prices are displayed in Indian Rupees (INR) and include applicable
        taxes unless stated otherwise. Delivery charges are calculated based on
        your delivery address and confirmed at checkout. Porter charges are
        payable by the customer directly to the delivery rider at the time of
        delivery and are separate from the order total.
      </p>

      <h2>5. Delivery</h2>
      <p>
        We deliver during selected morning and same-day time slots across our
        service areas in Delhi NCR. Delivery timing is estimated and may be
        affected by weather, traffic, access restrictions, or partner
        availability. We will communicate material delays using the contact
        details provided with your order. Please ensure someone is available to
        receive the delivery at the specified address.
      </p>

      <h2>6. Product variations</h2>
      <p>
        Flowers are natural products and may vary in colour, size, shape, and
        bloom stage from what is shown on the website. Product images are
        illustrative. We make every effort to match your order as closely as
        possible, but minor substitutions of equivalent or higher quality may
        occur based on seasonal availability.
      </p>

      <h2>7. Customer responsibilities</h2>
      <p>You are responsible for:</p>
      <ul>
        <li>
          Providing accurate contact, delivery, and payment information
        </li>
        <li>
          Ensuring someone is available at the delivery address to receive the
          order
        </li>
        <li>
          Inspecting delivered flowers and reporting any quality concerns within
          24 hours
        </li>
        <li>
          Paying Porter charges directly to the delivery rider where applicable
        </li>
      </ul>

      <h2>8. Cancellation and refund</h2>
      <p>
        Cancellation and refund options depend on the stage of order
        processing. Please refer to our{" "}
        <a href="/refund-policy">Refund &amp; Cancellation Policy</a> for
        detailed terms.
      </p>

      <h2>9. Intellectual property</h2>
      <p>
        All content on this website — including text, images, logos, graphics,
        and design — is the property of FreshFlower.zone and is protected by
        applicable intellectual property laws. You may not reproduce,
        distribute, or create derivative works without our written consent.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, FreshFlower.zone shall not be
        liable for any indirect, incidental, special, or consequential damages
        arising from the use of our website or services. Our total liability
        for any claim shall not exceed the amount paid for the specific order
        giving rise to the claim.
      </p>

      <h2>11. Force majeure</h2>
      <p>
        We shall not be liable for delays or failures in performance resulting
        from causes beyond our reasonable control, including natural disasters,
        extreme weather, government restrictions, pandemics, strikes, or
        disruptions to delivery partner networks.
      </p>

      <h2>12. Governing law</h2>
      <p>
        These terms are governed by and construed in accordance with the laws
        of India. Any disputes shall be subject to the exclusive jurisdiction
        of the courts in New Delhi, Delhi.
      </p>

      <h2>13. Changes to these terms</h2>
      <p>
        We reserve the right to modify these Terms of Service at any time.
        Changes will be effective upon posting on this page. Continued use of
        the website after changes constitutes acceptance of the updated terms.
      </p>

      <h2>14. Contact</h2>
      <p>
        For questions about these terms, contact us at{" "}
        <strong>hello@freshflower.zone</strong> or call{" "}
        <strong>+91 99999 99999</strong>.
      </p>
    </LegalPage>
  );
}
