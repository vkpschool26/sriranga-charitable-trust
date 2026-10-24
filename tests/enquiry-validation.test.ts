import { describe, expect, it } from "vitest";
import { enquirySchema } from "@/lib/validation/enquiry";

const volunteer = {
  kind: "volunteer",
  name: "Asha Kumar",
  email: "Asha@Example.com ",
  phone: "80950 32044",
  interest: "volunteer",
  message: "I would like to help with teaching on weekends.",
};

describe("enquiry validation", () => {
  it("accepts a valid volunteer enquiry and normalises fields", () => {
    const r = enquirySchema.safeParse(volunteer);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("asha@example.com");
      expect(r.data.phone).toBe("8095032044");
    }
  });

  it("requires phone and interest for volunteer enquiries", () => {
    const r = enquirySchema.safeParse({ ...volunteer, phone: "", interest: "" });
    expect(r.success).toBe(false);
    const paths = r.success ? [] : r.error.issues.map((i) => i.path[0]);
    expect(paths).toContain("phone");
    expect(paths).toContain("interest");
  });

  it("accepts a contact enquiry without a phone number", () => {
    const r = enquirySchema.safeParse({
      kind: "contact",
      name: "Ravi",
      email: "ravi@example.org",
      phone: "",
      subject: "Question about donations",
      message: "How can I donate books to the Trust?",
    });
    expect(r.success).toBe(true);
  });

  it("requires a subject for contact enquiries", () => {
    const r = enquirySchema.safeParse({ kind: "contact", name: "Ravi", email: "ravi@example.org", message: "Hello there, a question." });
    expect(r.success).toBe(false);
  });

  it("rejects invalid emails, short messages and unknown kinds", () => {
    expect(enquirySchema.safeParse({ ...volunteer, email: "not-an-email" }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...volunteer, message: "hi" }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...volunteer, kind: "admin" }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...volunteer, phone: "12345" }).success).toBe(false);
  });

  it("rejects over-long input", () => {
    expect(enquirySchema.safeParse({ ...volunteer, message: "x".repeat(5001) }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...volunteer, name: "x".repeat(101) }).success).toBe(false);
  });
});
