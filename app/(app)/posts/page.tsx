import type { Metadata } from "next";
import { PostsLibrary } from "@/components/posts/posts-library";

export const metadata: Metadata = { title: "Posts" };

/** `?status=draft|published` opens the list pre-filtered (the home page's "View drafts"). */
export default async function PostsPage({ searchParams }: { searchParams: Promise<{ status?: string | string[] }> }) {
  const { status } = await searchParams;
  const initialStatus = typeof status === "string" ? status : undefined;
  // Keyed so following a different filter link from this page starts fresh
  return <PostsLibrary key={initialStatus ?? "all"} initialStatus={initialStatus} />;
}
