// Built-in content, written from the registered Trust Deed (PDF page refs in
// comments). Used as a fallback until the database is set up, and mirrored
// in supabase/manual-setup/04_seed.sql. Admin edits in the database win.
import type {
  CauseIcon,
  CauseStatus,
  ContentKey,
  SiteSettingsRow,
} from "@/types/database";

export const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Manchaladore%2C%20Gubbi%20Taluk%2C%20Tumakuru%20District%2C%20Karnataka%20572117";

export const DEFAULT_SETTINGS: SiteSettingsRow = {
  id: 1,
  trust_name: "Sri Ranga Charitable Trust",
  short_name: "SRC Trust",
  tagline: "Grow Together",
  phone: "8095032044",
  // Registered office — deed p.2, clause 1
  address:
    "Sri Maradiranganatha Nilaya, Manchaladore, Gubbi Taluk, Tumkur District, Karnataka – 572117",
  map_url: MAP_URL,
  founded_on: "2025-12-04", // deed executed — p.1
  registration_no: "GBB-4-00511-2025-26", // Kaveri slip — p.17
  registration_date: "2025-12-08", // p.17
  registrar: "Sub Registrar, Gubbi", // p.17
  footer_note:
    "A registered charitable trust working for education, healthcare and the welfare of people in need.",
  seo_description:
    "Sri Ranga Charitable Trust (SRC Trust) is a registered charitable trust in Manchaladore, Gubbi Taluk, Tumkur District, working for education, healthcare, women and children, senior citizens and community welfare.",
  donation_message:
    "Your contribution — in money or in kind — helps the Trust begin and sustain its work for people in need.",
  donation_instructions:
    "If you would like your contribution acknowledged, please call us or share your details through the Get Involved form.",
  upi_id: "8095032044@ybl",
  upi_payee_name: null,
  upi_qr_path: null,
  bank_details: null,
  updated_at: "2026-01-01T00:00:00Z",
};

export interface Block {
  title: string | null;
  body: string | null;
}

export const DEFAULT_BLOCKS: Record<ContentKey, Block> = {
  "home.hero": {
    title: "Grow Together.",
    body: "A registered charitable trust from Gubbi, Tumkur, working to bring education, healthcare and dignity within reach of those who need it most.",
  },
  "home.intro": {
    title: "Founded on a simple promise: no one left behind.",
    body: "Sri Ranga Charitable Trust was founded in December 2025 by Sri M. K. Marudaiah, a social worker from Manchaladore, to uplift people who are poor and in need.\n\nWe are at the very beginning of our journey — and we will share every step of it openly.",
  },
  // p.1–2 recitals, p.17 registration
  "about.story": {
    title: "Our story",
    body: "Sri Ranga Charitable Trust — SRC Trust — was founded on 4 December 2025 by Sri M. K. Marudaiah, a social worker from Manchaladore in Gubbi Taluk, Tumkur District. Its trust deed was registered with the Sub Registrar, Gubbi, on 8 December 2025.\n\nThe Trust was created for the benefit of the public, with one purpose at its heart: to uplift people who are poor and in need. Its founding deed commits it to work in education, healthcare, the welfare of women and children, food and basic needs, the welfare of senior citizens, and the wider community.\n\nWe are at the beginning of this journey. As our work begins, every activity will be shared openly on this website.",
  },
  "about.mission": {
    title: "Our mission",
    body: "To uplift the poor and the vulnerable by supporting education, healthcare, livelihoods and basic needs — with no motive of profit.",
  },
  "about.vision": {
    title: "Our vision",
    body: "A community where access to education, healthcare and dignity is a right, not a privilege.",
  },
  "involved.intro": {
    title: "Stand with us",
    body: "Sri Ranga Charitable Trust is just beginning its work, and every helping hand matters. Whether you can offer time, skills, resources or partnership, we would be glad to hear from you.",
  },
};

export interface DefaultCause {
  slug: string;
  title: string;
  summary: string;
  description: string;
  icon: CauseIcon;
  status: CauseStatus;
}

// Deed clause 2, objectives i–xi (PDF p.3–6), grouped into causes.
export const DEFAULT_CAUSES: DefaultCause[] = [
  {
    slug: "education",
    title: "Education & Scholarships",
    icon: "education",
    status: "planned",
    // obj. i, iv (p.3), vi (p.4)
    summary:
      "Helping children and young people learn — from primary school through higher, technical and medical education.",
    description:
      "The Trust aims to promote primary, secondary and higher education, including technical and medical education and physical training. It may help establish and run schools, colleges and other institutions of learning, and award scholarships, stipends, prizes and financial assistance so that deserving students can continue their studies — in schools, colleges, technical institutions or art schools, in India or abroad.",
  },
  {
    slug: "healthcare",
    title: "Healthcare & Medical Relief",
    icon: "healthcare",
    status: "planned",
    // obj. iii (p.3), vii (p.4–5)
    summary:
      "Bringing medical care, medicine and relief within reach of people who cannot afford it.",
    description:
      "The Trust aims to help set up and support hospitals, charitable dispensaries, maternity homes, child welfare centres, convalescent homes and similar institutions that bring medical relief to those who are suffering. It also seeks to provide medicine to people in need and to encourage research and education in medical science.",
  },
  {
    slug: "women-and-children",
    title: "Women & Children",
    icon: "women-children",
    status: "planned",
    // recital p.1, obj. ii (p.3), v (p.4)
    summary:
      "Livelihood, skills and welfare support for women, and care for the wellbeing of children.",
    description:
      "The Trust aims to support schemes that provide livelihood and upliftment for poor women and promote the welfare of children. It seeks to encourage education and training for women in handicrafts and fine arts, and to establish or support centres and institutions that carry out social welfare work for women and children.",
  },
  {
    slug: "food-and-basic-needs",
    title: "Food & Basic Needs",
    icon: "food",
    status: "planned",
    // obj. iii (p.3), xi (p.6)
    summary:
      "Food, medicine and essential support for poor and deserving families.",
    description:
      "The Trust aims to provide food, medicine and other help — in whatever form is most needed — to poor and deserving people, and to support those in need with financial, educational and food assistance.",
  },
  {
    slug: "senior-citizens",
    title: "Senior Citizens' Welfare",
    icon: "seniors",
    status: "planned",
    // recital p.1, obj. i (p.3), xi (p.6)
    summary:
      "Care, shelter and dignity for elderly, infirm and destitute people.",
    description:
      "The Trust aims to work for the welfare of senior citizens, including building old age homes, and to support institutions — such as care homes and orphanages — that bring relief to the poor, the old, the infirm and the destitute.",
  },
  {
    slug: "community-welfare",
    title: "Community Welfare",
    icon: "community",
    status: "planned",
    // obj. viii, ix (p.5), x (p.6)
    summary:
      "Shared spaces and programmes that strengthen community life.",
    description:
      "The Trust aims to support playgrounds, parks and facilities for sports and games, along with community centres and meeting spaces for socially useful activities. More broadly, it seeks to promote activities anywhere in India that serve the general welfare of the public, without any motive of profit.",
  },
  {
    slug: "housing-and-community-buildings",
    title: "Housing & Community Buildings",
    icon: "housing",
    status: "planned",
    // obj. xi (p.6)
    summary:
      "Affordable housing sites for people in essential need, and buildings that serve the community.",
    description:
      "The Trust's deed allows it to develop land, form housing sites and construct buildings to be offered at a lower price to people in essential need. It also provides for building hostels, a school, a convention hall and temples for the community.",
  },
];

// Deed-backed governance facts shown as "How we work".
export const HOW_WE_WORK = [
  {
    title: "Trustees serve without pay",
    body: "Trustees receive no remuneration from the Trust.", // clause 21, p.16
  },
  {
    title: "Every rupee recorded",
    body: "True and accurate accounts are kept of all money received and spent.", // clause 10, p.12
  },
  {
    title: "Shared oversight",
    body: "The Trust's bank accounts are operated jointly by two or more trustees.", // clause 14, p.14
  },
  {
    title: "Not for profit",
    body: "Every objective is pursued for the public good, never for profit.", // obj. x, p.6
  },
] as const;

// How the Trust is funded — clause 3–4 (p.6–7), clause 8 (p.10), obj. xi (p.6)
export const FUNDING_NOTE =
  "The Trust was established with an initial fund contributed by its founder and trustees. It accepts donations in money or in kind from individuals and organisations who share its purpose, and its deed also allows it to take bank loans where needed to carry out its objectives.";

export const WAYS_TO_HELP = [
  {
    key: "volunteer",
    title: "Volunteer",
    body: "Offer your time and skills — teaching, health awareness, organising, or simply lending a hand when work begins on the ground.",
  },
  {
    key: "partner",
    title: "Partner with us",
    body: "Schools, hospitals, organisations and community groups who share our purpose can work with the Trust to reach more people.",
  },
  {
    key: "support",
    title: "Support our work",
    body: "Contribute money or in-kind support — books, medicines, food or materials — to help the Trust begin its programmes.",
  },
] as const;
