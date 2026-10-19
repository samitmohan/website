import fs from "node:fs";
import path from "node:path";
export type Book = { title: string; author: string; kind: string; color: string; url?: string; notes: string[]; placeholder?: boolean };
export type Film = { title: string; year: number; director: string; color: string; placeholder?: boolean };
export type Album = { title: string; artist: string; year: number; color: string; ink: string; placeholder?: boolean };

const DIR = path.join(process.cwd(), "content/shelf");
const read = <T,>(name: string): T[] => JSON.parse(fs.readFileSync(path.join(DIR, `${name}.json`), "utf8"));

export const getBooks = () => read<Book>("books");
export const getFilms = () => read<Film>("films");
export const getAlbums = () => read<Album>("music");
