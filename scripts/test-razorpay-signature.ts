import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { validPaymentSignature } from "../src/lib/payments/razorpay";

const secret = "unit-test-secret";
const signature = createHmac("sha256", secret).update("order_test|pay_test").digest("hex");

test("accepts a matching Razorpay payment signature", () => {
  assert.equal(validPaymentSignature("order_test", "pay_test", signature, secret), true);
});
test("rejects changed order, payment, or secret", () => {
  assert.equal(validPaymentSignature("order_other", "pay_test", signature, secret), false);
  assert.equal(validPaymentSignature("order_test", "pay_other", signature, secret), false);
  assert.equal(validPaymentSignature("order_test", "pay_test", signature, "wrong"), false);
});
test("rejects malformed signatures without throwing", () => {
  for (const value of ["", "abc", "g".repeat(64), "0".repeat(63), "0".repeat(65), "0".repeat(64)]) {
    assert.equal(validPaymentSignature("order_test", "pay_test", value, secret), false);
  }
});
