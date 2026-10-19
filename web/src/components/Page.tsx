import { Footer } from "./Footer";

/** The shared column: 620px, centred, room above for the fixed nav. */
export function Page({
  children,
  wide = false,
  personal = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
  personal?: boolean;
}) {
  return (
    <div data-scope={personal ? "personal" : undefined} className={personal ? "grain min-h-dvh" : "min-h-dvh"}>
      <main className={`mx-auto px-4 pt-28 pb-12 sm:pt-32 ${wide ? "max-w-[1100px]" : "max-w-[620px]"}`}>
        {children}
        <Footer />
      </main>
    </div>
  );
}
