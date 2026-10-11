import assert from "node:assert/strict";
import test from "node:test";
import { runCall } from "./agent";
import { DEMO_BRIEF } from "./parse";
import { signPayload as signBrowser, verifyPayload as verifyBrowser } from "./receipt.browser";
import { signPayload, verifyPayload } from "./receipt";

const sample = {
  v: 1,
  mode: "fixture",
  brief: DEMO_BRIEF,
  nested: { b: 2, a: [1, null, "香港"] },
};

test("the browser demo key signs the same bytes as node:crypto", async () => {
  const node = signPayload(sample);
  const browser = signBrowser(sample);
  assert.equal(browser.payload, node.payload);
  assert.equal(browser.signature, node.signature);
  assert.equal(browser.publicKey, node.publicKey);
  assert.equal(verifyPayload(browser.payload, browser.signature).ok, true);
  assert.equal(verifyBrowser(node.payload, node.signature).ok, true);
  assert.equal(verifyBrowser(browser.payload, `${browser.signature}x`).ok, false);

  const result = await runCall(DEMO_BRIEF, { apiKey: null });
  assert.ok(result.receipt);
  const checked = verifyPayload(result.receipt.payload, result.receipt.signature);
  assert.equal(checked.ok, true);
  if (!checked.ok) return;
  const again = signBrowser(checked.body);
  assert.equal(again.payload, result.receipt.payload);
  assert.equal(again.signature, result.receipt.signature);
});
