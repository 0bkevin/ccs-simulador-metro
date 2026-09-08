export function createSimulation(stops = []) {
  const first = stops[0]?.distance ?? 0;
  let s;
  const fresh = () => ({
    position: first,
    speed: 0,
    target: 0,
    doorsOpen: true,
    dwell: 3,
    started: false,
    missed: false,
    complete: false,
    paused: false,
    score: 100,
    serviceCount: 0,
  });
  s = fresh();
  const api = {
    get state() {
      return { ...s };
    },
    start() {
      s.started = true;
      return this;
    },
    reset() {
      s = fresh();
      s.started = true;
      return this;
    },
    pause(v = !s.paused) {
      s.paused = v;
      return this;
    },
    toggleDoors() {
      const stop = stops[s.target],
        zone = stop && Math.abs(s.position - stop.distance) <= 12;
      if (s.speed > 0.04 || !zone || s.missed || s.complete) return this.state;
      if (s.doorsOpen) {
        if (s.dwell <= 0) {
          s.doorsOpen = false;
          s.serviceCount++;
          if (s.target === stops.length - 1) s.complete = true;
          else s.target++;
        }
      } else {
        s.doorsOpen = true;
        s.dwell = 3;
      }
      return this.state;
    },
    recover() {
      const stop = stops[s.target];
      if (!stop || s.complete || !s.missed) return this.state;
      s.position = stop.distance;
      s.speed = 0;
      s.doorsOpen = true;
      s.dwell = 3;
      s.missed = false;
      s.score = Math.max(0, s.score - 15);
      return this.state;
    },
    tick(dt, input = {}) {
      if (!s.started || s.paused || s.complete) return this.state;
      const step = Math.min(Math.max(Number(dt) || 0, 0), 0.05);
      if (s.doorsOpen) s.dwell = Math.max(0, s.dwell - step);
      const traction = Boolean(input.throttle) && !s.doorsOpen && !s.missed;
      if (input.emergency) s.speed = Math.max(0, s.speed - 3 * step);
      else if (input.brake) s.speed = Math.max(0, s.speed - 2.5 * step);
      else if (traction) s.speed = Math.min(18, s.speed + 1.15 * step);
      else s.speed = Math.max(0, s.speed - 0.22 * step);
      s.position += s.speed * step;
      const stop = stops[s.target];
      if (stop && s.position > stop.distance + 12 && !s.missed) {
        s.missed = true;
        s.score = Math.max(0, s.score - 20);
      }
      return this.state;
    },
  };
  return api;
}
