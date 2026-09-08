export function createSimulation(stops = [], { routeEnd = Infinity } = {}) {
  const first = stops[0]?.distance ?? 0;
  const end = Math.max(stops.at(-1)?.distance ?? first, routeEnd);
  let s;
  const fresh = () => ({
    position: first,
    speed: 0,
    target: 0,
    doorsOpen: true,
    doorSide: stops[0]?.platformLayout === 'island' ? 1 : -1,
    doorStation: 0,
    lastServed: -1,
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
    setDoors(open) {
      open = Boolean(open);
      if (open === s.doorsOpen) return this.state;
      const station = s.doorsOpen ? s.doorStation : stops.findIndex((stop, i) =>
        (i === s.target || i === s.lastServed) && Math.abs(s.position - stop.distance) <= 12);
      const stop = stops[station];
      if (s.paused || s.speed > 0.04 || !stop || Math.abs(s.position - stop.distance) > 12 || s.missed || s.complete) return this.state;
      if (!open) {
        if (s.dwell <= 0) {
          s.doorsOpen = false;
          if (station > s.lastServed) {
            s.serviceCount++;
            s.lastServed = station;
            if (s.target === stops.length - 1) s.complete = true;
            else s.target++;
          }
        }
      } else {
        s.doorsOpen = true;
        s.doorStation = station;
        s.doorSide = stop.platformLayout === 'island' ? 1 : -1;
        s.dwell = station > s.lastServed ? 3 : 0;
      }
      return this.state;
    },
    toggleDoors() { return this.setDoors(!s.doorsOpen); },
    recover() {
      const stop = stops[s.target];
      if (!stop || s.complete || !s.missed) return this.state;
      s.position = stop.distance;
      s.speed = 0;
      s.doorsOpen = true;
      s.doorStation = s.target;
      s.doorSide = stop.platformLayout === 'island' ? 1 : -1;
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
      // A missed final stop must not carry the camera beyond the modeled tail.
      if (s.position >= end) { s.position = end; s.speed = 0; }
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
