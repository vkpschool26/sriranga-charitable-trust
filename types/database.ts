// Hand-written to match supabase/manual-setup/01_schema.sql.
// Once the Supabase project exists you can regenerate with:
//   npx supabase gen types typescript --project-id <ref> > types/database.ts

type Timestamps = { created_at: string; updated_at: string };

export type CauseIcon =
  | "education"
  | "healthcare"
  | "women-children"
  | "food"
  | "seniors"
  | "community"
  | "housing";

export type CauseStatus = "planned" | "active";
export type EnquiryKind = "volunteer" | "contact";
export type EnquiryInterest = "volunteer" | "donate" | "partner" | "general";
export type EnquiryStatus = "new" | "contacted" | "closed";
export type ContentKey =
  | "home.hero"
  | "home.intro"
  | "about.story"
  | "about.mission"
  | "about.vision"
  | "involved.intro";

export type SiteSettingsRow = {
  id: number;
  trust_name: string;
  short_name: string;
  tagline: string;
  phone: string | null;
  address: string | null;
  map_url: string | null;
  founded_on: string | null;
  registration_no: string | null;
  registration_date: string | null;
  registrar: string | null;
  footer_note: string | null;
  seo_description: string | null;
  donation_message: string | null;
  donation_instructions: string | null;
  upi_id: string | null;
  upi_payee_name: string | null;
  upi_qr_path: string | null;
  bank_details: string | null;
  updated_at: string;
}

export type ContentBlockRow = {
  key: ContentKey;
  title: string | null;
  body: string | null;
  updated_at: string;
}

export type TrusteeRow = Timestamps & {
  id: string;
  name: string;
  designation: string;
  bio: string | null;
  photo_path: string | null;
  photo_alt: string | null;
  sort_order: number;
  is_published: boolean;
}

export type CauseRow = Timestamps & {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  icon: CauseIcon;
  image_path: string | null;
  image_alt: string | null;
  status: CauseStatus;
  sort_order: number;
  is_published: boolean;
}

export type ActivityRow = Timestamps & {
  id: string;
  slug: string;
  title: string;
  activity_date: string;
  location: string | null;
  summary: string;
  description: string | null;
  is_published: boolean;
}

export type ActivityPhotoRow = {
  id: string;
  activity_id: string;
  storage_path: string;
  alt_text: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
  created_at: string;
}

export type EnquiryRow = Timestamps & {
  id: string;
  kind: EnquiryKind;
  name: string;
  email: string;
  phone: string | null;
  interest: EnquiryInterest | null;
  subject: string | null;
  message: string;
  status: EnquiryStatus;
  ip_hash: string | null;
}

export type AdminUserRow = {
  user_id: string;
  email: string;
  created_at: string;
}

// Insert/Update helpers: generated columns and defaults become optional.
type Insertable<Row, Optional extends keyof Row> = Omit<Row, Optional> &
  Partial<Pick<Row, Optional>>;

type Table<Row, Optional extends keyof Row> = {
  Row: Row;
  Insert: Insertable<Row, Optional>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      admin_users: Table<AdminUserRow, "created_at">;
      site_settings: Table<SiteSettingsRow, "id" | "updated_at">;
      content_blocks: Table<ContentBlockRow, "updated_at">;
      trustees: Table<
        TrusteeRow,
        "id" | "created_at" | "updated_at" | "sort_order" | "is_published"
      >;
      causes: Table<
        CauseRow,
        "id" | "created_at" | "updated_at" | "sort_order" | "is_published" | "status"
      >;
      activities: Table<
        ActivityRow,
        "id" | "created_at" | "updated_at" | "is_published"
      >;
      activity_photos: Table<
        ActivityPhotoRow,
        "id" | "created_at" | "sort_order" | "width" | "height"
      >;
      enquiries: Table<
        EnquiryRow,
        "id" | "created_at" | "updated_at" | "status" | "ip_hash"
      >;
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
