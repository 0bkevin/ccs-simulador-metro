import test from 'node:test';
import assert from 'node:assert/strict';
import { createMetroAudio } from '../src/audio.js';

const ids = ['idle', 'rolling', 'traction', 'braking', 'brake-release', 'emergency-brake', 'doors-open', 'doors-close', 'arrival-a', 'arrival-b', 'ambience-a', 'ambience-b'];
const manifest = {
  clips: Object.fromEntries(ids.map(id => [id, { url: id, source: 'test fixture', authenticity: 'verified-recording', gain: 0.5 }])),
  stations: { a: { arrival: 'arrival-a', ambience: 'ambience-a' }, b: { arrival: 'arrival-b', ambience: 'ambience-b' } },
};
const stops = [{ id: 'a', distance: 0 }, { id: 'b', distance: 510 }];
const base = { started: true, speed: 0, position: 0, doorsOpen: true, target: 0 };
function setup(options = {}) {
  const sources = [], requests = [];
  const param = () => ({ value: 0, cancelScheduledValues() {}, setTargetAtTime(v) { this.value = v; }, setValueAtTime(v) { this.value = v; } });
  const node = () => ({ connect(other) { return other; }, disconnect() {} });
  const context = {
    currentTime: 0, state: 'suspended', destination: {},
    createGain: () => ({ ...node(), gain: param() }),
    createDynamicsCompressor: () => ({ ...node(), ...Object.fromEntries(['threshold', 'knee', 'ratio', 'attack', 'release'].map(k => [k, param()])) }),
    createBufferSource() {
      const source = { ...node(), start() { this.started = true; }, stop() { this.stopped = true; this.onended?.(); } };
      sources.push(source); return source;
    },
    async decodeAudioData(id) { return { id, duration: 3 }; },
    async resume() { this.state = 'running'; },
    async close() { this.state = 'closed'; },
  };
  const engine = createMetroAudio({ stops, manifest, contextFactory: () => context,
    fetchAudio: async url => { requests.push(url); return { ok: true, arrayBuffer: async () => url }; }, ...options });
  const played = id => sources.filter(s => s.started && s.buffer.id === id);
  return { engine, context, sources, requests, played };
}

test('recordings load only after activation; source pitch remains unchanged', async () => {
  const t = setup(); t.engine.update(0.05, base);
  assert.equal(t.requests.length, 0);
  assert.equal(await t.engine.setEnabled(true), true);
  t.engine.update(0.05, base);
  assert.equal(t.played('arrival-a').length, 1);
  assert.equal(t.played('ambience-a').length, 1);
  t.engine.update(0.05, { ...base, position: 200, speed: 8, doorsOpen: false, throttle: true });
  assert.equal(t.played('rolling').length, 1);
  assert.equal(t.played('traction').length, 1);
  assert.ok(t.sources.every(s => s.playbackRate === undefined && s.detune === undefined));
  t.engine.dispose();
});

test('arrivals use actual stop location once per service, including the last station', async () => {
  const t = setup(); await t.engine.setEnabled(true);
  t.engine.update(0.05, base);
  t.engine.update(0.05, { ...base, target: 1, doorsOpen: false });
  t.engine.update(0.05, { ...base, target: 1 });
  assert.equal(t.played('arrival-a').length, 1);
  assert.equal(t.played('arrival-b').length, 0);
  t.engine.update(0.05, { ...base, target: 1, position: 510, speed: 2, doorsOpen: false });
  assert.equal(t.played('arrival-b').length, 0, 'passing a station must not announce an arrival');
  t.engine.update(0.05, { ...base, target: 1, position: 510, doorsOpen: false });
  assert.equal(t.played('arrival-b').length, 1, 'arrival precedes door opening');
  t.engine.update(0.05, { ...base, target: 1, position: 510 });
  assert.equal(t.played('arrival-b').length, 1);
  assert.equal(t.played('ambience-b').length, 1);
  t.engine.reset(); t.engine.update(0.05, base);
  assert.equal(t.played('arrival-a').length, 2);
  t.engine.dispose();
});

test('pause, tab hiding, mute, completion and disposal stop all live sources', async () => {
  for (const reason of ['paused', 'hidden', 'complete', 'mute', 'volume', 'dispose']) {
    const t = setup(); await t.engine.setEnabled(true); t.engine.update(0.05, base);
    if (reason === 'mute') await t.engine.setEnabled(false);
    else if (reason === 'volume') t.engine.setVolume(0);
    else if (reason === 'dispose') t.engine.dispose();
    else t.engine.update(0.05, { ...base, [reason]: true });
    assert.ok(t.sources.every(s => s.stopped), reason);
    assert.deepEqual(t.engine.status().playing, [], reason);
    t.engine.dispose();
  }
});

test('door one-shots fire only on real transitions, without replaying on resume', async () => {
  const t = setup(); await t.engine.setEnabled(true); t.engine.update(0.05, base);
  const closed = { ...base, doorsOpen: false };
  t.engine.update(0.05, closed); t.engine.update(0.05, closed);
  assert.equal(t.played('doors-close').length, 1);
  t.engine.update(0.05, { ...closed, paused: true }); t.engine.update(0.05, closed);
  assert.equal(t.played('doors-close').length, 1);
  assert.equal(t.played('arrival-a').length, 1);
  t.engine.update(0.05, base);
  assert.equal(t.played('doors-open').length, 1);
  t.engine.dispose();
});

test('missing, unverified and failed files remain silent; failed downloads can be retried', async () => {
  let fail = true;
  const t = setup({ manifest: { clips: { ...manifest.clips, fake: { url: 'fake', source: 'simulator' }, missing: null }, stations: manifest.stations },
    fetchAudio: async url => ({ ok: !(fail && url === 'rolling'), status: 404, arrayBuffer: async () => url }) });
  await t.engine.setEnabled(true);
  assert.ok(t.engine.status().failed.includes('rolling'));
  assert.deepEqual(t.engine.status().missing, ['fake', 'missing']);
  t.engine.update(0.05, { ...base, speed: 8, position: 100, doorsOpen: false });
  assert.equal(t.played('rolling').length, 0);
  fail = false; await t.engine.setEnabled(false); await t.engine.setEnabled(true);
  t.engine.update(0.05, { ...base, speed: 8, position: 100, doorsOpen: false });
  assert.equal(t.played('rolling').length, 1);
  assert.deepEqual(t.engine.status().failed, []);
  t.engine.dispose();
});

test('muting or disposing during fetch cannot start late playback', async () => {
  for (const dispose of [false, true]) {
    const resolvers = [];
    const t = setup({ fetchAudio: url => new Promise(resolve => resolvers.push(() => resolve({ ok: true, arrayBuffer: async () => url }))) });
    const pending = t.engine.setEnabled(true);
    await new Promise(resolve => setImmediate(resolve));
    if (dispose) t.engine.dispose(); else await t.engine.setEnabled(false);
    for (const resolve of resolvers) resolve();
    assert.equal(await pending, false);
    t.engine.update(0.05, base);
    assert.equal(t.sources.length, 0);
    assert.equal(t.engine.status().enabled, false);
    t.engine.dispose();
  }
});

test('empty catalog and unsupported audio report unavailable, never fake enabled', async () => {
  const t = setup({ manifest: { clips: { idle: null }, stations: {} } });
  assert.equal(await t.engine.setEnabled(true), false);
  assert.equal(t.engine.status().ready, false);
  const broken = setup({ contextFactory() { throw new Error('No audio device'); } });
  assert.equal(await broken.engine.setEnabled(true), false);
  assert.equal(broken.engine.status().error, 'No audio device');
  t.engine.dispose(); broken.engine.dispose();
});

test('all five stations have distinct, traceable audio assets matching their recorded hashes', async () => {
  const { readFile } = await import('node:fs/promises');
  const { createHash } = await import('node:crypto');
  const { recordingManifest } = await import('../src/audio-recordings.js');
  const provenance = JSON.parse(await readFile(new URL('../public/audio/recordings/provenance.json', import.meta.url)));
  assert.equal(Object.keys(recordingManifest.clips).length, 17);
  assert.equal(Object.keys(recordingManifest.stations).length, 5);
  const arrivalHashes = new Set(), ambienceHashes = new Set();
  for (const [id, clip] of Object.entries(provenance.clips)) {
    const bytes = await readFile(new URL(`../public/audio/recordings/${clip.file}`, import.meta.url));
    const hash = createHash('sha256').update(bytes).digest('hex');
    assert.equal(hash, clip.sha256, id);
    assert.equal(bytes.length, clip.bytes, id);
    assert.ok(clip.end > clip.start && clip.end - clip.start <= 12, id);
    assert.match(provenance.sources[clip.source].url, /^https:\/\/www.youtube.com\/watch\?v=/);
    if (id.startsWith('arrival-')) arrivalHashes.add(hash);
    if (id.startsWith('ambience-')) ambienceHashes.add(hash);
  }
  assert.equal(arrivalHashes.size, 5);
  assert.equal(ambienceHashes.size, 5);
  for (const [station, clips] of Object.entries(recordingManifest.stations)) {
    assert.equal(clips.arrival, `arrival-${station}`);
    assert.equal(clips.ambience, `ambience-${station}`);
    assert.ok(recordingManifest.clips[clips.arrival]);
    assert.ok(recordingManifest.clips[clips.ambience]);
  }
});

test('final station announcement and recorded closing warning finish after the last close command', async () => {
  const t = setup(); await t.engine.setEnabled(true);
  const last = { ...base, position: 510, target: 1 };
  t.engine.update(0.05, last);
  const complete = { ...last, doorsOpen: false, complete: true };
  t.engine.update(0.05, complete);
  assert.equal(t.played('arrival-b').length, 1);
  assert.equal(t.played('arrival-b')[0].stopped, undefined, 'the final station name must not be cut off');
  assert.equal(t.played('doors-close').length, 1);
  assert.deepEqual(t.engine.status().playing.sort(), ['announcement', 'doors']);
  t.engine.update(0.05, complete);
  assert.equal(t.played('doors-close').length, 1, 'no repeated warning on the completion screen');
  t.played('arrival-b')[0].onended(); t.played('doors-close')[0].onended();
  t.engine.update(0.05, complete);
  assert.deepEqual(t.engine.status().playing, []);
  t.engine.dispose();
});
