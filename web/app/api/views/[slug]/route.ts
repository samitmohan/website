import { incrementView, getView } from "@/lib/views";

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!SLUG_RE.test(slug)) {
    return Response.json({ error: "invalid slug" }, { status: 400 });
  }
  const views = await incrementView(slug);
  return Response.json({ views });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!SLUG_RE.test(slug)) {
    return Response.json({ error: "invalid slug" }, { status: 400 });
  }
  const views = await getView(slug);
  return Response.json({ views });
}
