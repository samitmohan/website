import fs from "node:fs";
import path from "node:path";

export type Pick = { title: string; by?: string; url?: string; img?: string; placeholder?: boolean };
export type Top4 = { books: Pick[]; videos: Pick[]; movies: Pick[]; artists: Pick[] };

export function getTop4(): Top4 {
  const data: Top4 = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/top4.json"), "utf8"));
  for (const [k, list] of Object.entries(data)) {
    if (list.length !== 4) throw new Error(`content/top4.json: ${k} has ${list.length} entries, needs exactly 4`);
  }
  return data;
}
