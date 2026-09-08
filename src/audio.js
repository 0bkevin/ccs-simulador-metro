/**
 * Metro de Caracas Line 1 sound bed.
 *
 * This deliberately uses Web Audio synthesis until a real recording is
 * available under a redistributable licence. The public references in
 * docs/AUDIO_SOURCES.md are authentic listening references, not bundled audio.
 */

export const actualRecordings = [
  {
    title: "Metro De Caracas Compilación Trenes Alstom y CAF",
    url: "https://www.youtube.com/watch?v=Ej0X90zrtNg",
    creator: "Dani215 Railway",
    date: "2024-07-17",
    license: "No redistributable licence verified on the source page; reference-only",
    authenticity: "creator's description identifies Line 1 CAF Renfe Serie 6 footage (61047–61080), alongside Alstom footage; no audio copied",
  },
  {
    title: "OpenBVE Venezuela CAF Serie 6 asset pack (external download)",
    url: "https://www.mediafire.com/file/om2u9qlgt7gaahw/Pack_Series_10000_y_60000_MCCS_FINAL.zip/file",
    creator: "OpenBVE Venezuela / uploader credited on the pack page",
    license: "No reuse licence or permission statement found in the page/archive; do not bundle",
    authenticity: "CAF S6 train asset includes WAV filenames, but the archive does not establish that they are field recordings",
  },
  {
    title: "Caracas Metro compilation (Line 1, 2006–2013)",
    url: "https://www.youtube.com/watch?v=86YCTUO5gQw",
    creator: "MonteBRujaFM",
    license: "No redistributable licence verified on the source page; reference-only",
    authenticity: "creator describes Caracas Line 1 rolling-stock footage; audio remains copyrighted",
  },
  {
    title: "Caracas Metro 10000 and 20000 series sound examples",
    url: "https://www.youtube.com/watch?v=gtgx51bclew",
    creator: "YouTube uploader (linked by r/transit discussion)",
    license: "No redistributable licence verified on the source page; reference-only",
    authenticity: "identified as older Caracas Alstom 10000/20000-series stock, not CAF 60000-series; not bundled",
  },
  {
    title: "Caracas Metro 10000 and 20000 series sound example 2",
    url: "https://www.youtube.com/watch?v=cbB9gqDMQ0o",
    creator: "YouTube uploader (linked by r/transit discussion)",
    license: "No redistributable licence verified on the source page; reference-only",
    authenticity: "identified as older Caracas Alstom 10000/20000-series stock, not CAF 60000-series; not bundled",
  },
];

export const audioDescription = {
  authenticity: "procedural gameplay fallback; no bundled Caracas recording",
  layers: [
    "three inharmonic inverter harmonics with speed ramps",
    "filtered rail/rolling noise and position-driven axle clicks",
    "door close chime and sliding door motor hiss",
    "speed-dependent brake rub/squeal",
    "quiet HVAC/compressor bed",
  ],
  sourcePolicy: "Only recordings with an explicit redistributable licence may be added to public/audio/.",
};

const TAU = Math.PI * 2;
const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));

function makeNoise(context, seconds = 2) {
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i += 1) {
    // A little persistence makes this less like white hiss and more like rail bed.
    last = last * 0.965 + (Math.random() * 2 - 1) * 0.18;
    data[i] = last;
  }
  return buffer;
}

export function createMetroAudio({ now = () => performance.now() / 1000, contextFactory = null } = {}) {
  let context = null;
  let enabled = false;
  let volume = 0.65;
  let disposed = false;
  let lastDoorsOpen = null;
  let lastUpdate = now();
  let axleClock = 0;
  let doorEnvelope = 0;
  let nodes = [];
  let master = null;
  let compressor = null;
  let motor = [];
  let motorGains = [];
  let rollingGain = null;
  let brakeGain = null;
  let hvacGain = null;
  let doorGain = null;
  let chimeGain = null;

  function makeOsc(type, frequency, destination, gain = 0) {
    const osc = context.createOscillator();
    const g = context.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    g.gain.value = gain;
    osc.connect(g).connect(destination);
    osc.start();
    nodes.push(osc, g);
    return { osc, gain: g };
  }

  function init() {
    if (context || disposed) return;
    const AudioCtor = contextFactory || globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioCtor) return;
    context = contextFactory ? contextFactory() : new AudioCtor();
    master = context.createGain();
    master.gain.value = 0;
    compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 16;
    compressor.ratio.value = 7;
    compressor.attack.value = 0.008;
    compressor.release.value = 0.18;
    master.connect(compressor).connect(context.destination);

    motor = [56, 112, 168].map((f, i) => {
      const item = makeOsc(i === 1 ? "triangle" : "sine", f, master, 0);
      motorGains.push(item.gain);
      return item.osc;
    });
    const noise = context.createBufferSource();
    noise.buffer = makeNoise(context);
    noise.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 760;
    filter.Q.value = 0.45;
    rollingGain = context.createGain();
    rollingGain.gain.value = 0;
    noise.connect(filter).connect(rollingGain).connect(master);
    noise.start();
    nodes.push(noise, filter, rollingGain);

    brakeGain = context.createGain();
    brakeGain.gain.value = 0;
    const brake = makeOsc("sawtooth", 145, brakeGain, 0.07);
    const brakeFilter = context.createBiquadFilter();
    brakeFilter.type = "bandpass";
    brakeFilter.frequency.value = 820;
    brakeFilter.Q.value = 2.1;
    brakeGain.disconnect();
    brakeGain.connect(brakeFilter).connect(master);
    nodes.push(brakeFilter, brake);

    hvacGain = context.createGain();
    hvacGain.gain.value = 0.002;
    hvacGain.connect(master);
    const hvac = makeOsc("sine", 47, hvacGain, 0.6);
    nodes.push(hvac);
    doorGain = context.createGain();
    doorGain.gain.value = 0;
    const doorMotor = context.createOscillator();
    const doorFilter = context.createBiquadFilter();
    doorMotor.type = "sawtooth";
    doorMotor.frequency.value = 1700;
    doorFilter.type = "bandpass";
    doorFilter.frequency.value = 1350;
    doorFilter.Q.value = 2;
    doorMotor.connect(doorFilter).connect(doorGain).connect(master);
    doorMotor.start();
    nodes.push(doorMotor, doorFilter, doorGain);
    chimeGain = context.createGain();
    chimeGain.gain.value = 1;
    chimeGain.connect(master);
    nodes.push(chimeGain);
  }

  const ramp = (param, value, time = 0.06) => {
    if (!context || !param) return;
    const t = context.currentTime;
    param.cancelScheduledValues(t);
    param.setTargetAtTime(value, t, time);
  };

  function playCloseChime() {
    if (!context || !enabled || !doorGain) return;
    const t = context.currentTime;
    [660, 880].forEach((frequency, index) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, t + index * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.06, t + index * 0.16 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + index * 0.16 + 0.22);
      osc.connect(gain).connect(chimeGain);
      osc.start(t + index * 0.16);
      osc.stop(t + index * 0.16 + 0.25);
    });
  }

  function update(dt, state = {}) {
    const step = clamp(Number(dt) || 0, 0, 0.1);
    lastUpdate = now();
    const doorsOpen = Boolean(state.doorsOpen);
    if (lastDoorsOpen !== doorsOpen && lastDoorsOpen !== null) {
      if (lastDoorsOpen === true && doorsOpen === false) playCloseChime();
      doorEnvelope = 1;
    }
    lastDoorsOpen = doorsOpen;
    if (!context || !enabled || disposed) return;
    const speed = clamp((Number(state.speed) || 0) / 18);
    const braking = Boolean(state.brake || state.emergency);
    doorEnvelope = Math.max(0, doorEnvelope - step / 0.8);
    const exterior = state.camera === "exterior" || state.cameraMode === "exterior";
    const attenuation = exterior ? 0.68 : 1;
    const active = Boolean(state.started) && !state.paused && !state.complete && !doorsOpen;
    const audible = Boolean(state.started) && !state.paused && !state.complete;
    const level = active ? attenuation : 0;
    ramp(master.gain, volume * (audible ? attenuation * (doorsOpen ? 0.055 : 0.1375 + speed * 0.275) : 0), 0.08);
    motor.forEach((osc, i) => ramp(osc.frequency, [56, 113, 171][i] + speed * [130, 260, 390][i], 0.1));
    const motorLoad = state.throttle ? 1 : 0.35;
    motorGains.forEach((g, i) => ramp(g.gain, level * (0.018 - i * 0.003) * (0.15 + speed) * motorLoad, 0.1));
    ramp(rollingGain.gain, level * (0.018 + speed * 0.035), 0.14);
    ramp(brakeGain.gain, level * (braking ? 0.8 : 0) * speed, 0.09);
    ramp(hvacGain.gain, audible ? attenuation * 0.012 : 0, 0.2);
    ramp(doorGain.gain, doorEnvelope * 0.012, 0.08);
    axleClock += step * (1.5 + speed * 13);
    if (active && speed > 0.03 && axleClock >= 1) {
      axleClock %= 1;
      const click = context.createOscillator();
      const gain = context.createGain();
      const t = context.currentTime;
      click.type = "triangle";
      click.frequency.value = 540 + Math.random() * 90;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.018 * speed), t + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
      click.connect(gain).connect(master);
      click.start(t);
      click.stop(t + 0.05);
    }
  }

  async function setEnabled(value) {
    if (disposed) return false;
    enabled = Boolean(value);
    if (enabled) {
      init();
      if (context && context.state === "suspended" && context.resume && typeof context.startRendering !== "function") await context.resume();
    }
    if (context) ramp(master.gain, enabled ? volume * 0.001 : 0, 0.04);
    return enabled;
  }

  function reset() {
    lastDoorsOpen = null;
    axleClock = 0;
    doorEnvelope = 0;
    if (context) ramp(master.gain, 0, 0.04);
  }

  function setVolume(value) {
    volume = clamp(Number(value) / 100, 0, 1);
    if (context && enabled) ramp(master.gain, volume * 0.001, 0.04);
    return volume * 100;
  }

  function dispose() {
    disposed = true;
    enabled = false;
    nodes.forEach((node) => { try { node.stop?.(); node.disconnect?.(); } catch {} });
    context?.close?.();
    nodes = [];
    context = null;
  }

  return {
    setEnabled,
    setVolume,
    update,
    reset,
    dispose,
    status: () => ({ enabled, available: Boolean(context), running: Boolean(context && context.state === "running"), lastUpdate }),
  };
}
