import Link from "next/link";

export const metadata = { title: "Mocks", robots: { index: false } };

const MOCKS = [
  { href: "/mocks/a", name: "A - Blend", note: "shwn's calm 620px column and blur-in reveals, stympaul's warm paper and red ink, gooey nav." },
  { href: "/mocks/b", name: "B - Mono", note: "colehardik: pure black/white, one weight, ghost-grey headline, full-bleed project plates." },
  { href: "/mocks/c", name: "C - Editorial", note: "stympaul: one long page of named scenes, oval buttons, serif italics, pinboard and shelf." },
];

export default function Mocks() {
  return (
    <main className="mx-auto max-w-[620px] px-4 py-32">
      <h1 className="text-[22px]">Pick a direction</h1>
      <p className="mt-2">Same content, three looks. Double-click anywhere on any of them to see dark mode.</p>
      <ul className="mt-10">
        {MOCKS.map((m) => (
          <li key={m.href}>
            <Link href={m.href} className="group block border-b border-hairline py-5">
              <span className="text-ink group-hover:text-accent">{m.name}</span>
              <span className="mt-1 block text-[14px]">{m.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
