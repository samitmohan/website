"use client";

import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/** `bare` drops the meta styling so the clock inherits its colour (the footer band sets it). */
export function Clock({ bare = false }: { bare?: boolean }) {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className={bare ? "tabular-nums" : "meta"} suppressHydrationWarning>
      bangalore {now ?? "--:--:--"}
    </span>
  );
}
