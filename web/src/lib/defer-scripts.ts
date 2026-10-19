/**
 * Mark every <script> in rendered post HTML inert, so the browser does not run
 * it during parsing. <RunScripts> replays them after mount, which is the only
 * way they also run on client-side navigation: React never executes scripts
 * that arrive through dangerouslySetInnerHTML.
 */
export function deferScripts(html: string): string {
  return html.replace(/<script(?![^>]*\btype=)/g, '<script type="text/x-deferred"');
}
