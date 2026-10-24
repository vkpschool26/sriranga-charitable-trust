import type { Metadata } from "next";
import { BlockForm } from "@/components/admin/BlockForm";
import { PageTitle } from "@/components/admin/ui";
import { DEFAULT_BLOCKS } from "@/lib/content/defaults";
import { createSessionClient } from "@/lib/supabase/server";
import type { ContentKey } from "@/types/database";

export const metadata: Metadata = { title: "Home & About Content" };

const BLOCKS: { key: ContentKey; label: string; where: string; rows?: number }[] = [
  { key: "home.hero", label: "Home — main banner", where: "Top of the home page" },
  { key: "home.intro", label: "Home — who we are", where: "Home page, below the banner", rows: 5 },
  { key: "about.story", label: "About — our story", where: "About Us page", rows: 10 },
  { key: "about.mission", label: "Mission", where: "About Us page and page header", rows: 3 },
  { key: "about.vision", label: "Vision", where: "About Us page and home page quote", rows: 3 },
  { key: "involved.intro", label: "Get Involved — introduction", where: "Top of the Get Involved page", rows: 4 },
];

export default async function ContentPage() {
  const db = await createSessionClient();
  const { data } = await db.from("content_blocks").select("*");
  const saved = new Map((data ?? []).map((b) => [b.key, b]));

  return (
    <>
      <PageTitle
        title="Home & About Content"
        description="Edit the main text on the Home, About Us and Get Involved pages. Please keep content factual — describe only work the Trust has actually done."
      />
      <div className="space-y-6">
        {BLOCKS.map((b) => {
          const row = saved.get(b.key);
          const fallback = DEFAULT_BLOCKS[b.key];
          return (
            <BlockForm
              key={b.key}
              blockKey={b.key}
              label={b.label}
              where={b.where}
              title={row?.title ?? fallback.title}
              body={row?.body ?? fallback.body}
              rows={b.rows}
            />
          );
        })}
      </div>
    </>
  );
}
