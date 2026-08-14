import { highlightCode } from "@/lib/markdown";
import { CopyCodeButton } from "@/components/ui/copy-code-button";

/* Self-contained code card: header bar with a language chip and a live copy
 * button over a numbered, syntax-highlighted body. The shape is Beautiful UI's
 * Code Block primitive (beautiful-ui-five.vercel.app, built by Turbo) minus the
 * line-by-line streaming, which is an agent-writing-code effect and only gets
 * in the way of reading finished code.
 *
 * The chrome deliberately matches the blog's code figures rather than importing
 * a second visual language: same chip, same copy pill, same radius. Highlighting
 * runs at build time through the shared Shiki instance. */

export async function CodeCard({
  code,
  lang = "python",
  label,
}: {
  code: string;
  lang?: string;
  label?: string;
}) {
  const html = await highlightCode(code, lang);

  return (
    <figure className="code-card">
      <div className="code-header">
        <span className="code-lang">{label ?? lang}</span>
        <CopyCodeButton code={code} />
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </figure>
  );
}
