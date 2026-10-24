import { describe, expect, it } from "vitest";
import { isAllowedFolder, isManagedPath } from "@/lib/storage";
import { displayPhone, formatDate, initials, paragraphs, slugify, telHref } from "@/lib/format";

const uuid = "3f2b8c1e-9a4d-4e7f-8b21-0c5d6e7f8a90";

describe("storage paths", () => {
  it("allows only known upload folders", () => {
    for (const f of ["site", "content", "trustees", "causes", `activities/${uuid}`]) expect(isAllowedFolder(f)).toBe(true);
    for (const f of ["", "gallery", "../site", "activities", "activities/not-a-uuid", "trustees/x", `activities/${uuid}/x`]) {
      expect(isAllowedFolder(f)).toBe(false);
    }
  });

  it("recognises only paths the app generated", () => {
    expect(isManagedPath(`trustees/${uuid}.webp`)).toBe(true);
    expect(isManagedPath(`activities/${uuid}/${uuid}.jpg`)).toBe(true);
    expect(isManagedPath(`trustees/../site/${uuid}.webp`)).toBe(false);
    expect(isManagedPath(`trustees/${uuid}.svg`)).toBe(false);
    expect(isManagedPath("other-bucket/file.png")).toBe(false);
  });
});

describe("format helpers", () => {
  it("formats date-only strings without timezone drift", () => {
    expect(formatDate("2025-12-08")).toBe("8 December 2025");
    expect(formatDate(null)).toBe("");
  });

  it("splits paragraphs on blank lines", () => {
    expect(paragraphs("One.\n\nTwo.\n  \nThree.")).toEqual(["One.", "Two.", "Three."]);
    expect(paragraphs(null)).toEqual([]);
  });

  it("makes URL-safe slugs", () => {
    expect(slugify("Free Health Camp & Check-up 2026")).toBe("free-health-camp-and-check-up-2026");
    expect(slugify("  Senior Citizens' Welfare ")).toBe("senior-citizens-welfare");
  });

  it("creates monogram initials from Indian name formats", () => {
    expect(initials("Sri M. K. Marudaiah")).toBe("MM");
    expect(initials("Smt. Boramma M. R.")).toBe("BM");
    expect(initials("Sri Nagendra H. N.")).toBe("NH");
  });

  it("formats phone numbers for display and dialling", () => {
    expect(displayPhone("8095032044")).toBe("+91 80950 32044");
    expect(telHref("8095032044")).toBe("tel:+918095032044");
  });
});
