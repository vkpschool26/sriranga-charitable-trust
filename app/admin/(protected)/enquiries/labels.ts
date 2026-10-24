import type { EnquiryInterest, EnquiryStatus } from "@/types/database";

export const STATUS_LABEL: Record<EnquiryStatus, string> = { new: "New", contacted: "Contacted", closed: "Closed" };
export const STATUS_TONE: Record<EnquiryStatus, "amber" | "blue" | "slate"> = { new: "amber", contacted: "blue", closed: "slate" };
export const INTEREST_LABEL: Record<EnquiryInterest, string> = {
  volunteer: "Volunteer",
  donate: "Donate",
  partner: "Partner",
  general: "General enquiry",
};
