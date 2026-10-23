import type { Metadata } from "next";
import { PostsLibrary } from "@/components/posts/posts-library";

export const metadata: Metadata = { title: "Posts" };

export default function PostsPage() {
  return <PostsLibrary />;
}
