import { describe, expect, it } from "vitest";
import type { NormalFormConfig, StepFormConfig } from "../types";
import {
  buildDefaultValues,
  buildSchemaFromConfig,
} from "../utils/buildSchema";

const config: NormalFormConfig = {
  mode: "normal",
  blocks: [
    {
      id: "block",
      layout: "single",
      fields: [
        {
          name: "name",
          type: "text",
          label: "Full Name",
          required: true,
          validation: {
            minLength: 2,
            messages: { minLength: "Name must be at least 2 characters" },
          },
        },
        { name: "email", type: "email", label: "Email", required: true },
        { name: "notes", type: "text", label: "Notes", required: false },
        {
          name: "age",
          type: "number",
          label: "Age",
          required: true,
          min: 18,
          max: 100,
        },
        {
          name: "acceptTerms",
          type: "checkbox",
          label: "Accept Terms",
          required: true,
        },
        {
          name: "skills",
          type: "checkbox-group",
          label: "Skills",
          required: true,
        },
      ],
    },
  ],
};

/** Valid base payload — each test mutates one field to inject the error. */
const valid = {
  name: "Alice",
  email: "alice@example.com",
  notes: "",
  age: 25,
  acceptTerms: true,
  skills: ["react"],
};

describe("buildSchemaFromConfig", () => {
  describe("required text with minLength", () => {
    it("fails when empty", async () => {
      const schema = buildSchemaFromConfig(config);
      const result = await schema.safeParseAsync({ ...valid, name: "" });
      expect(result.success).toBe(false);
    });

    it("fails when shorter than minLength", async () => {
      const schema = buildSchemaFromConfig(config);
      const result = await schema.safeParseAsync({ ...valid, name: "A" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.name).toContain(
          "Name must be at least 2 characters",
        );
      }
    });

    it("passes when at or above minLength", async () => {
      const schema = buildSchemaFromConfig(config);
      const result = await schema.safeParseAsync({ ...valid, name: "Al" });
      expect(result.success).toBe(true);
    });
  });

  describe("required email", () => {
    it("fails for invalid email", async () => {
      const schema = buildSchemaFromConfig(config);
      const result = await schema.safeParseAsync({
        ...valid,
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toBeDefined();
      }
    });

    it("passes for valid email", async () => {
      const schema = buildSchemaFromConfig(config);
      const result = await schema.safeParseAsync(valid);
      expect(result.success).toBe(true);
    });
  });

  describe("optional text field", () => {
    it("passes with empty string", async () => {
      const schema = buildSchemaFromConfig(config);
      const result = await schema.safeParseAsync({ ...valid, notes: "" });
      expect(result.success).toBe(true);
    });
  });

  describe("number with min/max", () => {
    it("fails below min", async () => {
      const schema = buildSchemaFromConfig(config);
      const result = await schema.safeParseAsync({ ...valid, age: 17 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.age).toBeDefined();
      }
    });

    it("fails above max", async () => {
      const schema = buildSchemaFromConfig(config);
      const result = await schema.safeParseAsync({ ...valid, age: 101 });
      expect(result.success).toBe(false);
    });

    it("passes within range", async () => {
      const schema = buildSchemaFromConfig(config);
      const result = await schema.safeParseAsync({ ...valid, age: 18 });
      expect(result.success).toBe(true);
    });
  });

  describe("required checkbox (must be true)", () => {
    it("fails when false", async () => {
      const schema = buildSchemaFromConfig(config);
      const result = await schema.safeParseAsync({
        ...valid,
        acceptTerms: false,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.acceptTerms).toBeDefined();
      }
    });

    it("passes when true", async () => {
      const schema = buildSchemaFromConfig(config);
      const result = await schema.safeParseAsync(valid);
      expect(result.success).toBe(true);
    });
  });

  describe("required checkbox-group", () => {
    it("fails when empty array", async () => {
      const schema = buildSchemaFromConfig(config);
      const result = await schema.safeParseAsync({ ...valid, skills: [] });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.skills).toBeDefined();
      }
    });

    it("passes with at least one item", async () => {
      const schema = buildSchemaFromConfig(config);
      const result = await schema.safeParseAsync({
        ...valid,
        skills: ["react"],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("phone field", () => {
    const phoneConfig: NormalFormConfig = {
      mode: "normal",
      blocks: [
        {
          id: "b",
          layout: "single",
          fields: [
            {
              name: "phone",
              type: "phone",
              label: "Phone Number",
              required: true,
            },
          ],
        },
      ],
    };

    it("fails for invalid phone", async () => {
      const schema = buildSchemaFromConfig(phoneConfig);
      const result = await schema.safeParseAsync({ phone: "+880123" });
      expect(result.success).toBe(false);
    });

    it("fails for empty required phone", async () => {
      const schema = buildSchemaFromConfig(phoneConfig);
      const result = await schema.safeParseAsync({ phone: "" });
      expect(result.success).toBe(false);
    });

    it("passes for valid E.164 phone", async () => {
      const schema = buildSchemaFromConfig(phoneConfig);
      const result = await schema.safeParseAsync({ phone: "+8801700000000" });
      expect(result.success).toBe(true);
    });
  });

  describe("stepped config", () => {
    it("collects fields from all steps", async () => {
      const steppedConfig: StepFormConfig = {
        mode: "stepped",
        steps: [
          {
            id: "s1",
            title: "Step 1",
            blocks: [
              {
                id: "b1",
                layout: "single",
                fields: [
                  { name: "city", type: "text", label: "City", required: true },
                ],
              },
            ],
          },
          {
            id: "s2",
            title: "Step 2",
            blocks: [
              {
                id: "b2",
                layout: "single",
                fields: [
                  {
                    name: "country",
                    type: "text",
                    label: "Country",
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      };
      const schema = buildSchemaFromConfig(steppedConfig);
      const ok = await schema.safeParseAsync({ city: "Dhaka", country: "BD" });
      expect(ok.success).toBe(true);
      const fail = await schema.safeParseAsync({ city: "", country: "BD" });
      expect(fail.success).toBe(false);
    });
  });
});

describe("buildDefaultValues", () => {
  it("returns empty string for text fields", () => {
    const defaults = buildDefaultValues(config);
    expect(defaults.name).toBe("");
    expect(defaults.notes).toBe("");
  });

  it("returns empty string for email", () => {
    const defaults = buildDefaultValues(config);
    expect(defaults.email).toBe("");
  });

  it("returns false for checkbox", () => {
    const defaults = buildDefaultValues(config);
    expect(defaults.acceptTerms).toBe(false);
  });

  it("returns empty array for checkbox-group", () => {
    const defaults = buildDefaultValues(config);
    expect(defaults.skills).toEqual([]);
  });

  it("returns undefined for number", () => {
    const defaults = buildDefaultValues(config);
    expect(defaults.age).toBeUndefined();
  });

  it("works with stepped config", () => {
    const steppedConfig: StepFormConfig = {
      mode: "stepped",
      steps: [
        {
          id: "s1",
          title: "Step 1",
          blocks: [
            {
              id: "b1",
              layout: "single",
              fields: [
                { name: "city", type: "text", label: "City" },
                { name: "agreed", type: "checkbox", label: "Agreed" },
              ],
            },
          ],
        },
      ],
    };
    const defaults = buildDefaultValues(steppedConfig);
    expect(defaults.city).toBe("");
    expect(defaults.agreed).toBe(false);
  });
});
