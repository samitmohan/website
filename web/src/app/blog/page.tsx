import type { Metadata } from "next";
import { PostList } from "@/components/PostList";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes from rebuilding ML from scratch: transformers, inference, training, and the maths underneath.",
  alternates: { canonical: "/blog" },
  openGraph: { images: ["/og/blog.png"] },
};

export default function Blog() {
  return <PostList tab="technical" posts={getAllPosts()} />;
}
