import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/ContentPages";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy policy | FreshFlower.zone",
  description:
    "How FreshFlower.zone collects, uses, and protects your personal information.",
  alternates: { canonical: canonical("/privacy-policy") },
  openGraph: {
    title: "Privacy policy | FreshFlower.zone",
    description:
      "How FreshFlower.zone collects, uses, and protects your personal information.",
    url: canonical("/privacy-policy"),
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy policy">
      <h2>1. Introduction</h2>
      <p>
        FreshFlower.zone (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
        &ldquo;our&rdquo;) is committed to protecting your privacy. This
        Privacy Policy explains how we collect, use, disclose, and safeguard
        your personal information when you visit our website, place an order,
        or interact with our services. By using our website, you agree to the
        practices described in this policy.
      </p>

      <h2>2. Information we collect</h2>
      <p>We may collect the following types of information:</p>
      <ul>
        <li>
          <strong>Personal identification information:</strong> Name, phone
          number, email address, and delivery address provided during order
          placement, quote requests, or contact form submissions.
        </li>
        <li>
          <strong>Order information:</strong> Products ordered, quantities,
          delivery dates, delivery slots, payment details (processed securely
          through our payment partners), and order history.
        </li>
        <li>
          <strong>Business information:</strong> Business name, role, and
          monthly volume estimates submitted through wholesale or wedding
          enquiry forms.
        </li>
        <li>
          <strong>Technical information:</strong> Browser type, device
          information, IP address, and browsing behaviour collected
          automatically through cookies and analytics tools.
        </li>
      </ul>

      <h2>3. How we use your information</h2>
      <p>We use the collected information to:</p>
      <ul>
        <li>Process and fulfil your flower orders and deliveries</li>
        <li>Respond to your enquiries, quotes, and customer support requests</li>
        <li>Send order confirmations, delivery updates, and service notifications</li>
        <li>Improve our website, product offerings, and delivery experience</li>
        <li>Send promotional communications (only with your consent; you may unsubscribe at any time)</li>
        <li>Comply with legal obligations and resolve disputes</li>
      </ul>

      <h2>4. Information sharing</h2>
      <p>
        We do not sell, rent, or trade your personal information. We may share
        your information with:
      </p>
      <ul>
        <li>
          <strong>Delivery partners (Porter and similar services):</strong> To
          complete your delivery, we share your name, phone number, delivery
          address, and any special delivery instructions.
        </li>
        <li>
          <strong>Payment processors:</strong> To securely process transactions.
          Payment card details are handled by the payment gateway and are not
          stored on our servers.
        </li>
        <li>
          <strong>Analytics and technology providers:</strong> Anonymised
          browsing data may be shared with analytics tools to help us improve
          the website experience.
        </li>
      </ul>

      <h2>5. Data security</h2>
      <p>
        We implement appropriate technical and organisational measures to
        protect your personal information against unauthorised access,
        alteration, disclosure, or destruction. However, no method of
        electronic transmission or storage is 100% secure, and we cannot
        guarantee absolute security.
      </p>

      <h2>6. Cookies</h2>
      <p>
        Our website uses cookies to enhance your browsing experience, remember
        your preferences, and analyse site traffic. You may control cookie
        settings through your browser preferences. Disabling cookies may
        affect certain website functionality.
      </p>

      <h2>7. Your rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access the personal information we hold about you</li>
        <li>Request correction of inaccurate or incomplete information</li>
        <li>Request deletion of your personal information (subject to legal retention requirements)</li>
        <li>Opt out of marketing communications at any time</li>
        <li>Lodge a complaint with a relevant data protection authority</li>
      </ul>

      <h2>8. Data retention</h2>
      <p>
        We retain your personal information only for as long as necessary to
        fulfil the purposes outlined in this policy, unless a longer retention
        period is required or permitted by law. Order records are retained for
        operational and legal compliance purposes.
      </p>

      <h2>9. Children&apos;s privacy</h2>
      <p>
        Our services are not directed to individuals under the age of 18. We do
        not knowingly collect personal information from children. If we become
        aware that we have collected information from a child, we will take
        steps to delete it promptly.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Any changes will
        be posted on this page with an updated effective date. We encourage you
        to review this policy periodically.
      </p>

      <h2>11. Contact us</h2>
      <p>
        If you have questions about this Privacy Policy or wish to exercise
        your rights, please contact us at{" "}
        <strong>hello@freshflower.zone</strong> or call us at{" "}
        <strong>+91 99999 99999</strong> during business hours.
      </p>
    </LegalPage>
  );
}
