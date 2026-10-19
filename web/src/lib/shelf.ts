import fs from "node:fs";
import path from "node:path";
import type { Album, Book, Film } from "@/components/Shelf";

const DIR = path.join(process.cwd(), "content/shelf");
const read = <T,>(name: string): T[] => JSON.parse(fs.readFileSync(path.join(DIR, `${name}.json`), "utf8"));

export const getBooks = () => read<Book>("books");
export const getFilms = () => read<Film>("films");
export const getAlbums = () => read<Album>("music");
