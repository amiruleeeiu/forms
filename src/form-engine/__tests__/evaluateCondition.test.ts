import { describe, expect, it } from "vitest";
import { evaluateCondition, getValueByPath } from "../utils/evaluateCondition";

// ---------------------------------------------------------------------------
// getValueByPath
// ---------------------------------------------------------------------------

describe("getValueByPath", () => {
  it("returns top-level value", () => {
    expect(getValueByPath({ a: 1 }, "a")).toBe(1);
  });

  it("returns nested value via dot-path", () => {
    expect(getValueByPath({ a: { b: { c: "deep" } } }, "a.b.c")).toBe("deep");
  });

  it("returns undefined for missing path", () => {
    expect(getValueByPath({ a: 1 }, "b")).toBeUndefined();
  });

  it("returns undefined when intermediate key is missing", () => {
    expect(getValueByPath({ a: {} }, "a.b.c")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// evaluateCondition — leaf operators
// ---------------------------------------------------------------------------

describe("evaluateCondition — eq", () => {
  it("returns true when values match", () => {
    expect(
      evaluateCondition(
        { field: "country", operator: "eq", value: "bd" },
        { country: "bd" },
      ),
    ).toBe(true);
  });

  it("returns false when values differ", () => {
    expect(
      evaluateCondition(
        { field: "country", operator: "eq", value: "bd" },
        { country: "us" },
      ),
    ).toBe(false);
  });
});

describe("evaluateCondition — neq", () => {
  it("returns true when values differ", () => {
    expect(
      evaluateCondition(
        { field: "status", operator: "neq", value: "inactive" },
        { status: "active" },
      ),
    ).toBe(true);
  });

  it("returns false when values match", () => {
    expect(
      evaluateCondition(
        { field: "status", operator: "neq", value: "active" },
        { status: "active" },
      ),
    ).toBe(false);
  });
});

describe("evaluateCondition — in", () => {
  it("returns true when actual is in the list", () => {
    expect(
      evaluateCondition(
        { field: "role", operator: "in", value: ["admin", "editor"] },
        { role: "admin" },
      ),
    ).toBe(true);
  });

  it("returns false when actual is not in the list", () => {
    expect(
      evaluateCondition(
        { field: "role", operator: "in", value: ["admin", "editor"] },
        { role: "viewer" },
      ),
    ).toBe(false);
  });

  it("returns false when value is not an array", () => {
    expect(
      evaluateCondition(
        { field: "role", operator: "in", value: "admin" },
        { role: "admin" },
      ),
    ).toBe(false);
  });
});

describe("evaluateCondition — not_in", () => {
  it("returns true when actual is not in the list", () => {
    expect(
      evaluateCondition(
        { field: "role", operator: "not_in", value: ["admin", "editor"] },
        { role: "viewer" },
      ),
    ).toBe(true);
  });

  it("returns false when actual is in the list", () => {
    expect(
      evaluateCondition(
        { field: "role", operator: "not_in", value: ["admin"] },
        { role: "admin" },
      ),
    ).toBe(false);
  });
});

describe("evaluateCondition — truthy / falsy", () => {
  it("truthy: returns true for non-empty string", () => {
    expect(
      evaluateCondition(
        { field: "name", operator: "truthy" },
        { name: "Alice" },
      ),
    ).toBe(true);
  });

  it("truthy: returns false for empty string", () => {
    expect(
      evaluateCondition({ field: "name", operator: "truthy" }, { name: "" }),
    ).toBe(false);
  });

  it("truthy: returns false for undefined", () => {
    expect(evaluateCondition({ field: "name", operator: "truthy" }, {})).toBe(
      false,
    );
  });

  it("falsy: returns true for empty string", () => {
    expect(
      evaluateCondition({ field: "name", operator: "falsy" }, { name: "" }),
    ).toBe(true);
  });

  it("falsy: returns false for truthy value", () => {
    expect(
      evaluateCondition(
        { field: "name", operator: "falsy" },
        { name: "Alice" },
      ),
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// evaluateCondition — dot-path
// ---------------------------------------------------------------------------

describe("evaluateCondition — dot-path field", () => {
  it("resolves nested field", () => {
    expect(
      evaluateCondition(
        { field: "address.district", operator: "eq", value: "dhaka" },
        { address: { district: "dhaka" } },
      ),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// evaluateCondition — and / or nodes
// ---------------------------------------------------------------------------

describe("evaluateCondition — and node", () => {
  it("returns true when all children are true", () => {
    expect(
      evaluateCondition(
        {
          and: [
            { field: "country", operator: "eq", value: "bd" },
            { field: "hasInsurance", operator: "truthy" },
          ],
        },
        { country: "bd", hasInsurance: true },
      ),
    ).toBe(true);
  });

  it("returns false when one child is false", () => {
    expect(
      evaluateCondition(
        {
          and: [
            { field: "country", operator: "eq", value: "bd" },
            { field: "hasInsurance", operator: "truthy" },
          ],
        },
        { country: "bd", hasInsurance: false },
      ),
    ).toBe(false);
  });
});

describe("evaluateCondition — or node", () => {
  it("returns true when at least one child is true", () => {
    expect(
      evaluateCondition(
        {
          or: [
            { field: "country", operator: "eq", value: "bd" },
            { field: "country", operator: "eq", value: "in" },
          ],
        },
        { country: "in" },
      ),
    ).toBe(true);
  });

  it("returns false when all children are false", () => {
    expect(
      evaluateCondition(
        {
          or: [
            { field: "country", operator: "eq", value: "bd" },
            { field: "country", operator: "eq", value: "in" },
          ],
        },
        { country: "us" },
      ),
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// evaluateCondition — deeply nested AND inside OR
// ---------------------------------------------------------------------------

describe("evaluateCondition — nested nodes", () => {
  it("evaluates nested and inside or", () => {
    const expr = {
      or: [
        { field: "role", operator: "eq" as const, value: "admin" },
        {
          and: [
            { field: "role", operator: "eq" as const, value: "editor" },
            { field: "active", operator: "truthy" as const },
          ],
        },
      ],
    };

    expect(evaluateCondition(expr, { role: "admin", active: false })).toBe(
      true,
    );
    expect(evaluateCondition(expr, { role: "editor", active: true })).toBe(
      true,
    );
    expect(evaluateCondition(expr, { role: "editor", active: false })).toBe(
      false,
    );
    expect(evaluateCondition(expr, { role: "viewer", active: true })).toBe(
      false,
    );
  });
});
