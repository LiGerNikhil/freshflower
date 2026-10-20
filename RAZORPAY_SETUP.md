# Razorpay Standard Checkout

## Configuration

The Next.js server reads `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` from the ignored `.env` file (or hosting environment). Restart the server after changing credentials or the order schema. `.env.local` overrides `.env` when the same key exists in both.

Only the public Key ID is returned by `/api/create-order`; no `NEXT_PUBLIC_` secret or hardcoded client credentials are used.

Enable **automatic capture** in the Razorpay Dashboard. An authorized payment is not marked paid until captured.

For browser-close recovery, configure a public HTTPS webhook at `/api/razorpay/webhook`, subscribe to `payment.captured` and `order.paid`, and set `RAZORPAY_WEBHOOK_SECRET` on the server to the webhook secret chosen in the dashboard. This is a separate secret from the API Key Secret. A local HTTPS tunnel is needed for Razorpay to reach localhost. The webhook rechecks payment details through Razorpay before updating the order.

## Customer flow

1. Sign in, add a product, and open `/checkout`.
2. Complete customer and delivery details, then click **Pay with Razorpay**.
3. The app creates its local order using database prices, then calls `POST /api/create-order` with `{ "orderId": "<local order id>" }`.
4. The server creates/reuses the Razorpay Order and returns `order_id`, `amount` in paise, `currency`, and public `key_id`. Browser-supplied amounts are not trusted; minimum is 100 paise.
5. Standard Checkout opens. Its success handler posts the three Razorpay fields to `/api/verify-payment`.
6. The server verifies HMAC-SHA256 against the stored order ID, checks ownership, fetches the payment, and checks amount, currency and captured status before marking paid.
7. The cart is cleared after verified payment. The confirmation page loads order details from the database. Pending orders offer payment retry/checking; paid orders show confirmation.

Dismissal and failure keep the order pending. Retrying reuses its gateway Order ID. Signed callback results are retained in session storage when verification is interrupted, so retrying verifies the existing payment instead of collecting another payment. A repeat create-order request also checks for an existing captured/authorized payment.

## Test mode

Run `npm run dev`, then follow the customer flow above. Use Razorpay's test netbanking mock success/failure screens or supported test cards from the official integration documentation. Test keys do not move real money; live UPI intent/QR behavior differs from test mode.

Check success, dismissal, payment failure, retry, invalid/missing signature fields, refreshing confirmation, and webhook delivery with the browser closed. Enable auto-capture before testing success.

Run `npx tsx --test scripts/test-razorpay-signature.ts` for signature tampering checks, `npm run lint`, and `npm run build`.

### Automated checks already run

- Signature helper accepted a matching HMAC and rejected changed order/payment/secret plus malformed hex.
- `POST /api/create-order` and `POST /api/verify-payment` return 401 when unauthenticated.
- Razorpay accepted the configured test keys and created a test order via the API.
- The checkout button opened the real gateway (a frame on `https://api.razorpay.com`).
- With a mocked gateway, dismissal and failure left the order pending and reused one local order across retries, while a signed success verified once, cleared the cart, and reached the paid confirmation state.

A real test-card payment through the live test modal and a real webhook delivery are still unverified.

## Existing behavior and boundaries

- Old manual UPI orders retain their evidence/review screens; new checkout orders use Razorpay (`paymentMethod: online`).
- The old `/api/payment/success` endpoint cannot mark unpaid online orders paid.
- Confirmation email is attempted after the payment transition; SMTP must be configured. Email failure does not reverse payment. There is no new durable email retry worker in this integration.
- Existing checkout stock deduction still happens at local order creation. Stock reservation/expiry and automatic cancellation are separate follow-up work.
- Refund initiation and refund webhook synchronization are not implemented here; use the Razorpay Dashboard and reconcile locally as needed.
- On deployment, set the live keys, live webhook secret and HTTPS webhook URL, and enable capture. Never commit `.env`.
