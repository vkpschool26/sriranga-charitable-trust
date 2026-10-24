import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PageTitle } from "@/components/admin/ui";
import { ActivityForm } from "@/components/admin/ActivityForm";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { createSessionClient } from "@/lib/supabase/server";
import { deleteActivity } from "../actions";

export const metadata: Metadata = { title: "Edit activity" };

export default async function EditActivityPage({ params, searchParams }: PageProps<"/admin/activities/[id]">) {
  const { id } = await params;
  const { created } = await searchParams;
  const db = await createSessionClient();
  const [{ data: activity }, { data: photos }] = await Promise.all([
    db.from("activities").select("*").eq("id", id).maybeSingle(),
    db.from("activity_photos").select("*").eq("activity_id", id).order("sort_order").order("created_at"),
  ]);
  if (!activity) notFound();
  return (
    <>
      <PageTitle
        title={activity.title}
        back={{ href: "/admin/activities/", label: "Gallery & Activities" }}
        action={
          <div className="flex gap-3">
            {activity.is_published && (
              <a href={`/gallery/${activity.slug}/`} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
                View on website ↗
              </a>
            )}
            <ConfirmDeleteButton action={deleteActivity.bind(null, activity.id)} confirmText={`Delete “${activity.title}” and all its photos? This cannot be undone.`} redirectTo="/admin/activities/" />
          </div>
        }
      />
      <div className="space-y-8">
        <PhotoManager activityId={activity.id} activityTitle={activity.title} photos={photos ?? []} />
        <ActivityForm activity={activity} notice={created ? "Activity created. Now add photos, then publish when ready." : undefined} />
      </div>
    </>
  );
}
