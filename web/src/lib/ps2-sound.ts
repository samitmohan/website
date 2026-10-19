/**
 * The PS2 startup sound (public/ps2/boot.mp3: the intro swell, then the logo
 * chime at 10.5s with the console's disc-read silence cut out). Playback
 * follows Ps2Boot's clock rather than the click, because the boot scene starts
 * only once three.js has loaded: whenever the audio is ready it starts at the
 * scene's current time, so the chime always lands on the logo.
 */
const SRC = "/ps2/boot.mp3";
let bytes: Promise<ArrayBuffer> | null = null;

/** Fetch the file ahead of time (once). */
export function preloadBootSound() {
  bytes ??= fetch(SRC)
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`${SRC}: ${r.status}`))))
    .catch((err) => {
      bytes = null;
      throw err;
    });
  return bytes;
}

/**
 * Call inside the click that powers on: browsers unlock audio during that
 * gesture. `elapsed` gives seconds since the boot scene started, or null before
 * it starts. Returns a function that fades the sound out.
 */
export function playBootSound(elapsed: () => number | null): () => void {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  const out = ctx.createGain();
  out.connect(ctx.destination);
  let stopped = false;

  preloadBootSound()
    // decodeAudioData takes ownership of the buffer; decode a copy so the cache stays usable.
    .then((b) => ctx.decodeAudioData(b.slice(0)))
    .then((buf) => {
      const begin = () => {
        if (stopped) return;
        const t = elapsed();
        if (t === null) return void requestAnimationFrame(begin);
        if (t >= buf.duration) return;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(out);
        src.start(0, t);
      };
      begin();
    })
    .catch((err) => console.warn("[ps2-sound]", err));

  return () => {
    if (stopped) return;
    stopped = true;
    const now = ctx.currentTime;
    out.gain.setValueAtTime(out.gain.value, now);
    out.gain.linearRampToValueAtTime(0, now + 0.5);
    setTimeout(() => ctx.close(), 600);
  };
}
