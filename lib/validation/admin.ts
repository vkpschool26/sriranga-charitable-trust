import { z } from "zod";
import {
  checkbox,
  isoDateSchema,
  optionalText,
  requiredText,
  slugSchema,
  storagePathSchema,
} from "./common";

const sortOrder = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? Number(v) : 0))
  .pipe(z.number().int("Use a whole number.").min(0).max(100000));

export const trusteeSchema = z.object({
  name: requiredText("Name", 2, 120),
  designation: requiredText("Designation", 2, 80),
  bio: optionalText("Description", 1200),
  photo_path: storagePathSchema,
  photo_alt: optionalText("Photo description", 200),
  sort_order: sortOrder,
  is_published: checkbox,
});

export const causeSchema = z.object({
  title: requiredText("Title", 2, 120),
  slug: slugSchema,
  summary: requiredText("Summary", 10, 400),
  description: optionalText("Description", 4000),
  icon: z.enum(["education", "healthcare", "women-children", "food", "seniors", "community", "housing"], {
    error: "Choose an icon.",
  }),
  status: z.enum(["planned", "active"], { error: "Choose a status." }),
  image_path: storagePathSchema,
  image_alt: optionalText("Image description", 200),
  sort_order: sortOrder,
  is_published: checkbox,
});

export const activitySchema = z.object({
  title: requiredText("Title", 2, 160),
  slug: slugSchema,
  activity_date: isoDateSchema,
  location: optionalText("Location", 160),
  summary: requiredText("Summary", 10, 400),
  description: optionalText("Description", 8000),
  is_published: checkbox,
});

export const photoUpdateSchema = z.object({
  alt_text: requiredText("Photo description", 2, 300),
  caption: optionalText("Caption", 300),
});

export const blockSchema = z.object({
  key: z.enum(["home.hero", "home.intro", "about.story", "about.mission", "about.vision", "involved.intro"]),
  title: optionalText("Heading", 200),
  body: optionalText("Text", 4000),
});

export const settingsSchema = z.object({
  trust_name: requiredText("Trust name", 2, 120),
  short_name: requiredText("Short name", 2, 40),
  tagline: requiredText("Tagline", 2, 80),
  phone: optionalText("Phone", 20),
  address: optionalText("Address", 300),
  map_url: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^https:\/\//.test(v), "Map link must start with https://"),
  registration_no: optionalText("Registration number", 60),
  registration_date: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid date."),
  founded_on: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid date."),
  registrar: optionalText("Registering office", 120),
  footer_note: optionalText("Footer note", 300),
  seo_description: optionalText("Search description", 300),
});

export const donationSchema = z.object({
  donation_message: optionalText("Donation message", 600),
  donation_instructions: optionalText("Instructions", 1500),
  upi_id: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(v), "Enter a valid UPI ID, e.g. name@bank."),
  upi_payee_name: optionalText("Payee name", 120),
  upi_qr_path: storagePathSchema,
  bank_details: optionalText("Bank details", 800),
});

export const enquiryStatusSchema = z.enum(["new", "contacted", "closed"]);
