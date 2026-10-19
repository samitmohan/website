import type { Metadata } from "next";
import { PostList } from "@/components/PostList";
import { getPersonalPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Personal",
  description: "Trips, lists, and things that are not about machine learning.",
};

export default function Personal() {
  return <PostList tab="personal" posts={getPersonalPosts()} />;
}
