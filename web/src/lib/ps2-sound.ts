/**
 * The PS2 startup sound, synthesised with Web Audio (no audio files). Timed to
 * Ps2Boot's timeline: a low hum, a rising whoosh, a wide chord with glassy
 * sparkles over the tower scene, and a bell ping when the logo appears.
 * Returns a function that fades everything out.
 */
export function playBootSound(): () => void {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  const t0 = ctx.currentTime + 0.05;

  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  // A three-second hall: decaying stereo noise as the impulse response.
  const verb = ctx.createConvolver();
  const len = ctx.sampleRate * 3;
  const ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.6;
  }
  verb.buffer = ir;
  const wet = ctx.createGain();
  wet.gain.value = 0.55;
  verb.connect(wet).connect(master);
  const bus = ctx.createGain();
  bus.connect(master);
  bus.connect(verb);

  const env = (g: GainNode, at: number, peak: number, attack: number, hold: number, release: number) => {
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(peak, at + attack);
    g.gain.setValueAtTime(peak, at + attack + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, at + attack + hold + release);
  };

  // Hum: 55 Hz and its harmonics, under everything until the fly-up.
  for (const [f, a] of [[55, 0.14], [110, 0.07], [165, 0.03]] as const) {
    const o = ctx.createOscillator();
    o.frequency.value = f;
    const g = ctx.createGain();
    env(g, t0 + 0.9, a, 1.4, 4.2, 1.2);
    o.connect(g).connect(bus);
    o.start(t0 + 0.9);
    o.stop(t0 + 8);
  }

  // Whoosh: noise through a band-pass sweeping upward.
  const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const nd = noise.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const ns = ctx.createBufferSource();
  ns.buffer = noise;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.4;
  bp.frequency.setValueAtTime(300, t0 + 1);
  bp.frequency.exponentialRampToValueAtTime(3200, t0 + 2.6);
  const ng = ctx.createGain();
  env(ng, t0 + 1, 0.12, 0.9, 0.2, 0.6);
  ns.connect(bp).connect(ng).connect(bus);
  ns.start(t0 + 1);

  // The chord: D major 9, two slightly detuned saws per note, softened.
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(900, t0 + 2);
  lp.frequency.linearRampToValueAtTime(2200, t0 + 3.5);
  lp.connect(bus);
  for (const f of [146.83, 220, 293.66, 369.99, 440, 659.25]) {
    for (const cents of [-6, 6]) {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f;
      o.detune.value = cents;
      const g = ctx.createGain();
      env(g, t0 + 2, 0.018, 1.2, 2.6, 1.8);
      o.connect(g).connect(lp);
      o.start(t0 + 2);
      o.stop(t0 + 8);
    }
  }

  // Sparkles: short high sine pings scattered across the stereo field.
  for (let i = 0; i < 18; i++) {
    const at = t0 + 2.2 + Math.random() * 3.3;
    const o = ctx.createOscillator();
    o.frequency.value = 2000 + Math.random() * 2500;
    const g = ctx.createGain();
    env(g, at, 0.025, 0.005, 0, 0.4);
    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.6 - 0.8;
    o.connect(g).connect(pan).connect(bus);
    o.start(at);
    o.stop(at + 0.5);
  }

  // The logo ping: a bell made of a fundamental and an inharmonic partial.
  for (const [f, a, type] of [[1760, 0.1, "sine"], [2637, 0.04, "triangle"], [4402, 0.015, "sine"]] as const) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    const g = ctx.createGain();
    env(g, t0 + 8.3, a, 0.004, 0, 1.8);
    o.connect(g).connect(bus);
    o.start(t0 + 8.3);
    o.stop(t0 + 10.3);
  }

  return () => {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 0.5);
    setTimeout(() => ctx.close(), 700);
  };
}
