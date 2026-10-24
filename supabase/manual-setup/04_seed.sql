-- =============================================================
-- Sri Ranga Charitable Trust — 04 Seed content (verified)
-- Run after 03_storage.sql. Content is written from the registered
-- Trust Deed (Document No. GBB-4-00511-2025-26).
-- Re-running will NOT overwrite edits made in the admin dashboard.
-- =============================================================

insert into public.site_settings (id, trust_name, short_name, tagline, phone, address, founded_on, registration_no, registration_date, registrar, footer_note, seo_description, donation_message, donation_instructions, upi_id, map_url)
values (1,
  'Sri Ranga Charitable Trust',
  'SRC Trust',
  'Grow Together',
  '8095032044',
  'Sri Maradiranganatha Nilaya, Manchaladore, Gubbi Taluk, Tumkur District, Karnataka – 572117',
  '2025-12-04',
  'GBB-4-00511-2025-26',
  '2025-12-08',
  'Sub Registrar, Gubbi',
  'A registered charitable trust working for education, healthcare and the welfare of people in need.',
  'Sri Ranga Charitable Trust (SRC Trust) is a registered charitable trust in Manchaladore, Gubbi Taluk, Tumkur District, working for education, healthcare, women and children, senior citizens and community welfare.',
  'Your contribution — in money or in kind — helps the Trust begin and sustain its work for people in need.',
  'If you would like your contribution acknowledged, please call us or share your details through the Get Involved form.',
  '8095032044@ybl',
  'https://www.google.com/maps/search/?api=1&query=Manchaladore%2C%20Gubbi%20Taluk%2C%20Tumakuru%20District%2C%20Karnataka%20572117'
)
on conflict (id) do nothing;

insert into public.content_blocks (key, title, body) values
  ('home.hero', 'Grow Together.', 'A registered charitable trust from Gubbi, Tumkur, working to bring education, healthcare and dignity within reach of those who need it most.'),
  ('home.intro', 'Founded on a simple promise: no one left behind.', 'Sri Ranga Charitable Trust was founded in December 2025 by Sri M. K. Marudaiah, a social worker from Manchaladore, to uplift people who are poor and in need.

We are at the very beginning of our journey — and we will share every step of it openly.'),
  ('about.story', 'Our story', 'Sri Ranga Charitable Trust — SRC Trust — was founded on 4 December 2025 by Sri M. K. Marudaiah, a social worker from Manchaladore in Gubbi Taluk, Tumkur District. Its trust deed was registered with the Sub Registrar, Gubbi, on 8 December 2025.

The Trust was created for the benefit of the public, with one purpose at its heart: to uplift people who are poor and in need. Its founding deed commits it to work in education, healthcare, the welfare of women and children, food and basic needs, the welfare of senior citizens, and the wider community.

We are at the beginning of this journey. As our work begins, every activity will be shared openly on this website.'),
  ('about.mission', 'Our mission', 'To uplift the poor and the vulnerable by supporting education, healthcare, livelihoods and basic needs — with no motive of profit.'),
  ('about.vision', 'Our vision', 'A community where access to education, healthcare and dignity is a right, not a privilege.'),
  ('involved.intro', 'Stand with us', 'Sri Ranga Charitable Trust is just beginning its work, and every helping hand matters. Whether you can offer time, skills, resources or partnership, we would be glad to hear from you.')
on conflict (key) do nothing;

-- Causes: published, all marked 'planned' until work actually begins.
insert into public.causes (slug, title, summary, description, icon, status, sort_order, is_published) values
  ('education', 'Education & Scholarships', 'Helping children and young people learn — from primary school through higher, technical and medical education.', 'The Trust aims to promote primary, secondary and higher education, including technical and medical education and physical training. It may help establish and run schools, colleges and other institutions of learning, and award scholarships, stipends, prizes and financial assistance so that deserving students can continue their studies — in schools, colleges, technical institutions or art schools, in India or abroad.', 'education', 'planned', 10, true),
  ('healthcare', 'Healthcare & Medical Relief', 'Bringing medical care, medicine and relief within reach of people who cannot afford it.', 'The Trust aims to help set up and support hospitals, charitable dispensaries, maternity homes, child welfare centres, convalescent homes and similar institutions that bring medical relief to those who are suffering. It also seeks to provide medicine to people in need and to encourage research and education in medical science.', 'healthcare', 'planned', 20, true),
  ('women-and-children', 'Women & Children', 'Livelihood, skills and welfare support for women, and care for the wellbeing of children.', 'The Trust aims to support schemes that provide livelihood and upliftment for poor women and promote the welfare of children. It seeks to encourage education and training for women in handicrafts and fine arts, and to establish or support centres and institutions that carry out social welfare work for women and children.', 'women-children', 'planned', 30, true),
  ('food-and-basic-needs', 'Food & Basic Needs', 'Food, medicine and essential support for poor and deserving families.', 'The Trust aims to provide food, medicine and other help — in whatever form is most needed — to poor and deserving people, and to support those in need with financial, educational and food assistance.', 'food', 'planned', 40, true),
  ('senior-citizens', 'Senior Citizens'' Welfare', 'Care, shelter and dignity for elderly, infirm and destitute people.', 'The Trust aims to work for the welfare of senior citizens, including building old age homes, and to support institutions — such as care homes and orphanages — that bring relief to the poor, the old, the infirm and the destitute.', 'seniors', 'planned', 50, true),
  ('community-welfare', 'Community Welfare', 'Shared spaces and programmes that strengthen community life.', 'The Trust aims to support playgrounds, parks and facilities for sports and games, along with community centres and meeting spaces for socially useful activities. More broadly, it seeks to promote activities anywhere in India that serve the general welfare of the public, without any motive of profit.', 'community', 'planned', 60, true),
  ('housing-and-community-buildings', 'Housing & Community Buildings', 'Affordable housing sites for people in essential need, and buildings that serve the community.', 'The Trust''s deed allows it to develop land, form housing sites and construct buildings to be offered at a lower price to people in essential need. It also provides for building hostels, a school, a convention hall and temples for the community.', 'housing', 'planned', 70, true)
on conflict (slug) do nothing;

-- Trustees: from the Trust Deed (clause 4, PDF p.7–8; clause 23, PDF p.18).
-- Seeded UNPUBLISHED. Publish each one from the admin dashboard after the
-- trustees confirm they are happy to appear on the public website.
insert into public.trustees (name, designation, sort_order, is_published)
select v.name, v.designation, v.sort_order, false
from (values
  ('Sri M. K. Marudaiah',     'Founder & Managing Trustee', 10),
  ('Sri M. S. Praveen Kumar', 'Secretary',                  20),
  ('Smt. Boramma M. R.',      'Trustee',                    30),
  ('Smt. Dhanushree C. V.',   'Trustee',                    40),
  ('Sri Nagendra H. N.',      'Trustee',                    50),
  ('Smt. R. Veena',           'Trustee',                    60)
) as v(name, designation, sort_order)
where not exists (select 1 from public.trustees);
