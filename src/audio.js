import { recordingManifest, actualRecordings, audioDescription } from './audio-recordings.js';
export { actualRecordings, audioDescription };

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number(value) || 0));

/** Recording playback only. Missing recordings remain silent. */
export function createMetroAudio({ stops = [], manifest = recordingManifest, contextFactory = null,
  fetchAudio = (...args) => fetch(...args), now = () => performance.now() / 1000, onStatus = () => {}, loadTimeoutMs = 15000 } = {}) {
  let context, master, limiter, loading = null;
  let enabled = false, disposed = false, ready = false, volume = 0.65;
  let lastUpdate = now(), previous = null, state = {}, generation = 0, resumeRequest = null, finishing = false;
  const buffers = new Map(), loops = new Map(), voices = new Map();
  const saved = new Map(), live = new Set(), events = new Map();
  const announced = new Set(), failures = new Map(), controller = new AbortController();
  // A WAV filename or a simulator's train name is not proof of a field recording.
  const clips = Object.fromEntries(Object.entries(manifest.clips).filter(([, clip]) =>
    clip?.url && clip.authenticity === 'verified-recording' && clip.source));

  function status() {
    return { enabled, available: Boolean(context), running: context?.state === 'running',
      loading: Boolean(loading), ready, loaded: buffers.size, total: Object.keys(clips).length,
      missing: Object.keys(manifest.clips).filter(id => !clips[id]), failed: [...failures.keys()],
      error: failures.get('context') || null, playing: [...loops.keys(), ...voices.keys()], lastUpdate };
  }
  const report = () => { if (!disposed) onStatus(status()); };
  const active = () => enabled && ready && state.started && !state.paused && !state.hidden && !state.complete;
  function ramp(param, value, seconds = 0.08) {
    param.cancelScheduledValues(context.currentTime);
    param.setTargetAtTime(value, context.currentTime, seconds);
  }
  function init() {
    if (context) return true;
    try {
      const Ctor = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!contextFactory && !Ctor) throw new Error('Este navegador no admite audio Web Audio.');
      context = contextFactory ? contextFactory() : new Ctor();
      master = context.createGain(); master.gain.value = 0;
      limiter = context.createDynamicsCompressor();
      limiter.threshold.value = -6; limiter.knee.value = 6; limiter.ratio.value = 12;
      limiter.attack.value = 0.003; limiter.release.value = 0.2;
      master.connect(limiter).connect(context.destination);
      return true;
    } catch (error) {
      master?.disconnect(); limiter?.disconnect(); context?.close?.().catch?.(() => {});
      context = master = limiter = null;
      failures.set('context', error.message); enabled = false; report(); return false;
    }
  }
  async function load() {
    if (loading) return loading;
    loading = Promise.all(Object.entries(clips).filter(([id]) => !buffers.has(id)).map(async ([id, clip]) => {
      const request = new AbortController();
      let timer, abort;
      try {
        const buffer = await Promise.race([
          (async () => {
            const response = await fetchAudio(clip.url, { signal: request.signal });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return context.decodeAudioData(await response.arrayBuffer());
          })(),
          new Promise((_, reject) => {
            abort = () => { request.abort(); reject(new Error('Carga cancelada')); };
            controller.signal.addEventListener('abort', abort, { once: true });
            timer = setTimeout(() => { request.abort(); reject(new Error('Tiempo de carga agotado')); }, loadTimeoutMs);
          }),
        ]);
        if (disposed) return;
        if (!Number.isFinite(buffer.duration) || buffer.duration <= 0) throw new Error('Grabación vacía');
        buffers.set(id, buffer); failures.delete(id);
      } catch (error) { if (!disposed) failures.set(id, error.message); }
      finally { clearTimeout(timer); controller.signal.removeEventListener('abort', abort); }
    })).then(() => { loading = null; ready = buffers.size > 0; report(); });
    report(); return loading;
  }
  function stop(voice, fade = 0) {
    if (!voice) return;
    if (fade) ramp(voice.gain.gain, 0, fade / 4);
    try { voice.source.stop(context.currentTime + fade); } catch { /* already ended */ }
    if (!fade) { voice.source.disconnect(); voice.gain.disconnect(); }
  }
  function clear(preserve = false) {
    if (preserve) {
      for (const [slot, voice] of voices) {
        const offset = voice.offset + context.currentTime - voice.startedAt;
        if (offset < buffers.get(voice.id).duration) saved.set(slot, { id: voice.id, offset, gain: voice.level, cycle: voice.cycle });
      }
    } else { finishing = false; saved.clear(); events.clear(); }
    for (const voice of [...live]) stop(voice);
    loops.clear(); voices.clear();
    if (master) {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setValueAtTime(0, context.currentTime);
    }
  }
  function play(id, { loop = false, gain = 1, slot = id, finish = false, offset = 0, cycle } = {}) {
    const buffer = buffers.get(id);
    const finalClose = finish && enabled && ready && state.started && state.complete && !state.paused && !state.hidden;
    if (!buffer || offset >= buffer.duration || (!active() && !finalClose) || volume === 0) return null;
    const collection = loop ? loops : voices;
    stop(collection.get(slot), 0.04);
    const source = context.createBufferSource(), output = context.createGain();
    source.buffer = buffer; source.loop = loop;
    // Original pitch and speed: no pitch shifting, generated waveforms or synthetic noise.
    const level = clamp(clips[id].gain ?? 1) * gain;
    output.gain.value = loop ? 0 : level;
    source.connect(output).connect(master);
    const voice = { source, gain: output, id, offset, cycle, startedAt: context.currentTime, level: gain };
    live.add(voice);
    collection.set(slot, voice);
    source.onended = () => {
      source.disconnect(); output.disconnect();
      live.delete(voice);
      if (collection.get(slot) === voice) collection.delete(slot);
    };
    source.start(0, offset);
    if (loop) ramp(output.gain, level);
    return voice;
  }
  function resumeVoices() {
    for (const [slot, voice] of saved) play(voice.id, { ...voice, slot, finish: finishing });
    saved.clear();
  }
  function setEvent(slot, requested, gain) {
    if (!requested) { stop(voices.get(slot)); voices.delete(slot); }
    else if (!events.get(slot)) play(slot, { slot, gain });
    const voice = voices.get(slot);
    if (voice) { voice.level = gain; ramp(voice.gain.gain, clamp(clips[voice.id].gain ?? 1) * gain); }
    events.set(slot, requested);
  }
  function syncDoors(finish = false) {
    if ('doorAudio' in state) {
      const cue = state.doorAudio, voice = voices.get('doors');
      if (!cue) { stop(voice); voices.delete('doors'); return; }
      const offset = cue.offset || 0;
      // Seek only when the animation and audio clocks diverge (pause, slow frame,
      // reversal or enabling sound mid-cycle). Source rate and pitch stay intact.
      if (!voice || voice.cycle !== cue.cycle || voice.id !== cue.id ||
          Math.abs(voice.offset + context.currentTime - voice.startedAt - offset) > 0.2) {
        stop(voice); voices.delete('doors');
        play(cue.id, { slot: 'doors', finish, offset, cycle: cue.cycle });
      }
    } else if (previous?.started && Boolean(state.doorsOpen) !== Boolean(previous.doorsOpen)) {
      play(state.doorsOpen ? 'doors-open' : 'doors-close', { slot: 'doors', finish });
    }
  }
  function setLoop(slot, id, gain) {
    let voice = loops.get(slot);
    if (!id || gain < 0.001 || volume === 0) {
      stop(voice, 0.12); loops.delete(slot); return;
    }
    if (voice?.id !== id) voice = play(id, { loop: true, gain, slot });
    if (voice) ramp(voice.gain.gain, clamp(clips[id].gain ?? 1) * gain, 0.12);
  }
  function update(dt, next = {}) {
    state = { ...next }; lastUpdate = now();
    if (disposed) return;
    if (!state.started || !enabled) { clear(); previous = { ...state }; return; }
    if (state.paused || state.hidden) {
      clear(true); return;
    }
    if (ready && context.state === 'suspended' && !resumeRequest && !context.startRendering) {
      const request = generation;
      resumeRequest = context.resume().catch(error => {
        if (!disposed && request === generation) {
          failures.set('context', error.message); enabled = false; clear(); report();
        }
      }).finally(() => { resumeRequest = null; });
    }
    // The simulation completes as soon as the last close command is accepted.
    // Let that physical door cycle and the final station message finish normally.
    if (state.complete) {
      if (!previous?.complete && previous?.started && !previous.paused && previous.doorsOpen && !state.doorsOpen) {
        finishing = true;
      }
      if (state.doorAudio) finishing = true;
      if (finishing) { resumeVoices(); syncDoors(true); }
      for (const voice of loops.values()) stop(voice);
      loops.clear();
      for (const [slot, voice] of voices) {
        if (!['doors', 'announcement'].includes(slot)) { stop(voice); voices.delete(slot); }
      }
      if (!finishing || !voices.size) clear();
      else ramp(master.gain, volume * (['exterior', 'platform'].includes(state.cameraMode || state.camera) ? 0.75 : 1));
      previous = { ...state }; return;
    }
    if (!active()) { previous = { ...state }; return; }
    resumeVoices();
    const speed = clamp(state.speed, 0, 18), stopped = speed <= 0.04;
    const wasActive = previous?.started && !previous.paused && !previous.hidden && !previous.complete;
    syncDoors();
    if (stopped && (previous?.speed || 0) > 0.04 && wasActive && !previous.missed &&
        (state.brake || state.emergency || previous.brake || previous.emergency)) {
      play('brake-release', { slot: 'brake-release' });
    }
    // target advances at door close, so resolve the station from physical position.
    const station = stops.find(stop => Math.abs(Number(state.position) - stop.distance) <= 12);
    if (station && stopped && !state.missed && volume > 0 && !announced.has(station.id)) {
      if (play(manifest.stations[station.id]?.arrival, { slot: 'announcement' })) announced.add(station.id);
    }
    const duck = voices.has('announcement') ? 0.32 : 1;
    const exterior = ['exterior', 'platform'].includes(state.cameraMode || state.camera);
    ramp(master.gain, volume * (exterior ? 0.75 : 1));
    setLoop('rolling', 'rolling', stopped ? 0 : (0.15 + speed / 18 * 0.55) * duck);
    const doorFraction = clamp(state.doorFraction ?? (state.doorsOpen ? 1 : 0));
    const braking = !stopped && Boolean(state.brake || state.emergency);
    setEvent('traction', !stopped && Boolean(state.throttle) && !braking && !state.missed && !state.doorsOpen && doorFraction < 0.001, 0.45 * duck);
    setEvent('braking', braking, 0.4 * duck);
    const ambience = station && stopped && !state.missed && doorFraction > 0 ? manifest.stations[station.id]?.ambience : null;
    setLoop('station', ambience, ambience ? 0.45 * duck * doorFraction : 0);
    previous = { ...state };
  }
  async function setEnabled(value) {
    if (disposed) return false;
    const request = ++generation; enabled = Boolean(value);
    if (!enabled) { clear(); report(); return false; }
    if (!init()) return false;
    try {
      // Resume inside the click handler, before fetching, for browser user activation.
      if (context.state === 'suspended' && !context.startRendering) await context.resume();
      failures.delete('context'); await load();
      if (disposed || request !== generation) return false;
      enabled = ready; previous = null; report(); return enabled;
    } catch (error) {
      if (!disposed && request === generation) {
        failures.set('context', error.message); enabled = false; clear(); report();
      }
      return false;
    }
  }
  function reset() { clear(); announced.clear(); previous = null; state = {}; }
  function setVolume(value) {
    volume = clamp(Number(value) / 100);
    if (volume === 0) clear(); else if (active()) update(0, state);
    return volume * 100;
  }
  function dispose() {
    if (disposed) return;
    disposed = true; enabled = false; generation++;
    controller.abort(); clear(); buffers.clear(); master?.disconnect(); limiter?.disconnect();
    context?.close?.().catch?.(() => {});
  }
  return { setEnabled, setVolume, update, reset, dispose, status };
}
