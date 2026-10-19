import Link from "next/link";
import { Page } from "@/components/Page";

export default function NotFound() {
  return (
    <Page>
      <p className="meta">404</p>
      <h1 className="mt-2 text-[28px]">This page diverged.</h1>
      <p className="mt-2">Loss went to NaN somewhere around here. Try the <Link className="link" href="/">home page</Link> or the <Link className="link" href="/blog">writing</Link>.</p>
    </Page>
  );
}
