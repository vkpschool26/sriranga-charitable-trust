import type { CauseIcon as CauseIconName } from "@/types/database";

const paths: Record<CauseIconName, React.ReactNode> = {
  education: (
    <>
      <path d="M3 5.6C5.5 4.2 8.6 4.3 12 6.2c3.4-1.9 6.5-2 9-.6v13c-2.5-1.4-5.6-1.3-9 .6-3.4-1.9-6.5-2-9-.6v-13Z" />
      <path d="M12 6.2v13" />
    </>
  ),
  healthcare: (
    <>
      <path d="M12 20.5s-7.5-4.6-7.5-10.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 2.5c0 5.8-7.5 10.4-7.5 10.4Z" />
      <path d="M12 10.2v5M9.5 12.7h5" />
    </>
  ),
  "women-children": (
    <>
      <circle cx="8.5" cy="5.8" r="2.3" />
      <circle cx="16.8" cy="9.6" r="1.8" />
      <path d="M4.5 20.5v-4.6a4 4 0 0 1 8 0v4.6M14 20.5v-3a2.8 2.8 0 0 1 5.6 0v3" />
    </>
  ),
  food: (
    <>
      <path d="M3.5 12.5h17a8.5 8.5 0 0 1-17 0Z" />
      <path d="M9 9c0-1.2 1.2-1.6 1.2-2.8S9 4.6 9 4.6M14.2 9c0-1.2 1.2-1.6 1.2-2.8s-1.2-1.6-1.2-1.6" />
    </>
  ),
  seniors: (
    <>
      <path d="M12 12.8s-3.6-2.2-3.6-4.8A2.1 2.1 0 0 1 12 6.7a2.1 2.1 0 0 1 3.6 1.3c0 2.6-3.6 4.8-3.6 4.8Z" />
      <path d="M2.8 13.2 6.6 18.6h3.6c1 0 1.8.8 1.8 1.8M21.2 13.2l-3.8 5.4h-3.6c-1 0-1.8.8-1.8 1.8" />
    </>
  ),
  community: (
    <>
      <circle cx="12" cy="6.5" r="2.2" />
      <circle cx="5.2" cy="9.5" r="1.8" />
      <circle cx="18.8" cy="9.5" r="1.8" />
      <path d="M8 20.5v-3.8a4 4 0 0 1 8 0v3.8M2.2 20.5v-2.6a3 3 0 0 1 4.6-2.5M21.8 20.5v-2.6a3 3 0 0 0-4.6-2.5" />
    </>
  ),
  housing: (
    <>
      <path d="M3 11.2 12 4l9 7.2" />
      <path d="M5.4 9.4v11.1h13.2V9.4M10 20.5v-5.2h4v5.2" />
    </>
  ),
};

export function CauseIcon({
  name,
  className = "h-6 w-6",
}: {
  name: CauseIconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name] ?? paths.community}
    </svg>
  );
}

export const CAUSE_ICON_OPTIONS: { value: CauseIconName; label: string }[] = [
  { value: "education", label: "Education (book)" },
  { value: "healthcare", label: "Healthcare (heart)" },
  { value: "women-children", label: "Women & children" },
  { value: "food", label: "Food (bowl)" },
  { value: "seniors", label: "Seniors (caring hands)" },
  { value: "community", label: "Community (people)" },
  { value: "housing", label: "Housing (home)" },
];
