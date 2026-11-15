import type { Metadata } from "next";
import { ActivityPage } from "@/components/activity/activity-page";

export const metadata: Metadata = { title: "Activity" };

/** `?view=failed` opens the log on failed deliveries (the home page's "Review" links). */
export default async function Page({ searchParams }: { searchParams: Promise<{ view?: string | string[] }> }) {
  const { view } = await searchParams;
  const initialView = typeof view === "string" ? view : undefined;
  // Keyed so following a different filter link from this page starts fresh
  return <ActivityPage key={initialView ?? "all"} initialView={initialView} />;
}
