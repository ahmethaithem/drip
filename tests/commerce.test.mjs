import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { calculateTotals, formatEGP, normalizeEgyptianPhone } from "../lib/commerce.mjs";

test("Egyptian mobile formats are normalized consistently", () => {
  for (const prefix of ["010", "011", "012", "015"]) {
    assert.equal(normalizeEgyptianPhone(`${prefix}12345678`), `+2${prefix}12345678`);
    assert.equal(normalizeEgyptianPhone(`+2${prefix}-1234-5678`), `+2${prefix}12345678`);
  }
  assert.equal(normalizeEgyptianPhone("07701234567"), null);
  assert.equal(normalizeEgyptianPhone("010123"), null);
});
test("shipping is charged once per non-empty order", () => {
  assert.deepEqual(calculateTotals([{ quantity: 1 }]), { totalQuantity:1, subtotalEGP:1499, shippingFeeEGP:100, codAmountEGP:1599 });
  assert.deepEqual(calculateTotals([{ quantity: 2 }, { quantity: 3 }]), { totalQuantity:5, subtotalEGP:7495, shippingFeeEGP:100, codAmountEGP:7595 });
  assert.deepEqual(calculateTotals([]), { totalQuantity:0, subtotalEGP:0, shippingFeeEGP:0, codAmountEGP:0 });
});
test("customer-facing prices use the EGP code", () => {
  assert.equal(formatEGP(1499), "1,499 EGP");
});
test("catalog contains exactly the three approved products", async () => {
  const source = await readFile(new URL("../lib/products.ts", import.meta.url), "utf8");
  assert.equal((source.match(/id: \"/g) ?? []).length, 3);
  assert.match(source, /ferrari-black/); assert.match(source, /\"bmw\"/); assert.match(source, /ferrari-pink/);
});
test("governorate catalog contains all 27 entries", async () => {
  const source = await readFile(new URL("../lib/governorates.ts", import.meta.url), "utf8");
  assert.equal((source.match(/^  \".+\",$/gm) ?? []).length, 27);
});

