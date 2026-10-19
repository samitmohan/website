import Link from "next/link";

/** Technical / Personal, as two real URLs so each tab is linkable and static. */
export function BlogTabs({ active }: { active: "technical" | "personal" }) {
  const tab = (href: string, label: string, on: boolean) => (
    <Link href={href} className="pill" aria-current={on ? "page" : undefined}>
      {label}
    </Link>
  );
  return (
    <div className="flex gap-2">
      {tab("/blog", "Technical", active === "technical")}
      {tab("/blog/personal", "Personal", active === "personal")}
    </div>
  );
}
