import { describe, it, expect } from "vitest";
import th from "../messages/th.json";
import en from "../messages/en.json";
import zh from "../messages/zh.json";

// ดึง key แบบ flatten (เช่น "nav.search") เพื่อเทียบ 3 ภาษา
function flatten(obj: Record<string, any>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    return typeof v === "object" && v !== null ? flatten(v, key) : [key];
  });
}

describe("i18n message catalogs", () => {
  const thKeys = flatten(th).sort();
  const enKeys = flatten(en).sort();
  const zhKeys = flatten(zh).sort();

  it("อังกฤษมี key ครบเท่าไทย", () => {
    expect(enKeys).toEqual(thKeys);
  });

  it("จีนมี key ครบเท่าไทย", () => {
    expect(zhKeys).toEqual(thKeys);
  });

  it("ทุก value ไม่ว่างเปล่า", () => {
    for (const cat of [th, en, zh]) {
      for (const key of flatten(cat)) {
        const value = key.split(".").reduce((o: any, k) => o[k], cat);
        expect(value, `key: ${key}`).toBeTruthy();
      }
    }
  });
});
