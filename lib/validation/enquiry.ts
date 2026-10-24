import { z } from "zod";
import { emailSchema, phoneSchema, requiredText } from "./common";

export const INTERESTS = [
  { value: "volunteer", label: "Volunteer" },
  { value: "donate", label: "Donate" },
  { value: "partner", label: "Partner" },
  { value: "general", label: "General enquiry" },
] as const;

const base = {
  name: requiredText("Name", 2, 100),
  email: emailSchema,
  message: requiredText("Message", 10, 5000),
};

export const volunteerEnquirySchema = z.object({
  kind: z.literal("volunteer"),
  ...base,
  phone: phoneSchema,
  interest: z.enum(["volunteer", "donate", "partner", "general"], {
    error: "Please choose what you are interested in.",
  }),
});

export const contactEnquirySchema = z.object({
  kind: z.literal("contact"),
  ...base,
  phone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .pipe(phoneSchema.optional()),
  subject: requiredText("Subject", 2, 150),
});

export const enquirySchema = z.discriminatedUnion("kind", [
  volunteerEnquirySchema,
  contactEnquirySchema,
]);

export type EnquiryInput = z.infer<typeof enquirySchema>;
