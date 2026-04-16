// __tests__/reject.test.ts
import { describe, it, expect } from "vitest";
import { DEFAULT_REJECTION_TEMPLATE, expandRejectionTemplate } from "@/lib/reject";

describe("expandRejectionTemplate", () => {
  it("substitutes {name} with the candidate's name", () => {
    const result = expandRejectionTemplate("Hi {name},", { name: "Jane Doe" }, "Program X");
    expect(result).toBe("Hi Jane Doe,");
  });

  it("substitutes {program} with the program name", () => {
    const result = expandRejectionTemplate(
      "interest in the {program}.",
      { name: "Jane" },
      "2026 Graduate Program"
    );
    expect(result).toBe("interest in the 2026 Graduate Program.");
  });

  it("replaces all occurrences of each token", () => {
    const result = expandRejectionTemplate(
      "{name} … {program} … {name} again",
      { name: "Jane" },
      "Prog"
    );
    expect(result).toBe("Jane … Prog … Jane again");
  });

  it("returns a template with no tokens unchanged", () => {
    const result = expandRejectionTemplate("No tokens here.", { name: "J" }, "P");
    expect(result).toBe("No tokens here.");
  });

  it("leaves unknown tokens untouched", () => {
    const result = expandRejectionTemplate("Hi {foo}", { name: "Jane" }, "P");
    expect(result).toBe("Hi {foo}");
  });

  it("exports a sensible default template containing both tokens", () => {
    expect(DEFAULT_REJECTION_TEMPLATE).toContain("{name}");
    expect(DEFAULT_REJECTION_TEMPLATE).toContain("{program}");
  });
});
