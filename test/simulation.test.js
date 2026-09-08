import test from "node:test";
import assert from "node:assert/strict";
import { createSimulation } from "../src/simulation.js";
import stations from "../src/route.js";

function tickFor(sim, seconds, input = {}) {
  for (let elapsed = 0; elapsed < seconds; elapsed += 0.05)
    sim.tick(0.05, input);
}

function finishDwellAndClose(sim) {
  tickFor(sim, 3);
  return sim.toggleDoors();
}

function startAtCanoAmarillo() {
  const sim = createSimulation(stations);
  sim.start();
  finishDwellAndClose(sim);
  return sim;
}

function driveTo(sim, index) {
  const stop = stations[index];
  let guard = 0;
  while (sim.state.target === index && !sim.state.missed && guard++ < 20000) {
    const remaining = stop.distance - sim.state.position;
    const brakingDistance = sim.state.speed ** 2 / 5 + 5;
    sim.tick(
      0.05,
      remaining <= brakingDistance ? { brake: true } : { throttle: true },
    );
  }
  assert.equal(sim.state.missed, false, `se pasó ${stop.name}`);
  assert.equal(sim.state.target, index);
  assert.ok(
    Math.abs(sim.state.position - stop.distance) <= 12,
    `fuera de zona en ${stop.name}`,
  );
  assert.ok(sim.state.speed <= 0.04, `tren aún se mueve en ${stop.name}`);
}

test("no avanza antes de iniciar y reinicia un servicio limpio", () => {
  const sim = createSimulation(stations);
  sim.tick(2, { throttle: true });
  assert.equal(sim.state.position, 0);
  assert.equal(sim.state.started, false);
  sim.start();
  sim.reset();
  assert.equal(sim.state.started, true);
  assert.equal(sim.state.target, 0);
  assert.equal(sim.state.position, 0);
  assert.equal(sim.state.speed, 0);
  assert.equal(sim.state.doorsOpen, true);
  assert.equal(sim.state.dwell, 3);
  assert.equal(sim.state.score, 100);
});

test("la ruta jugable conserva el orden oeste–este de las cinco estaciones", () => {
  assert.deepEqual(
    stations.map((station) => station.name),
    ["Caño Amarillo", "Capitolio", "Bellas Artes", "Plaza Venezuela", "Altamira"],
  );
  assert.deepEqual(stations.map((station) => station.distance), [0, 900, 1800, 2800, 3900]);
});

test("sirve las cinco estaciones en orden y completa al cerrar en Altamira", () => {
  const sim = startAtCanoAmarillo();
  for (let index = 1; index < stations.length; index += 1) {
    driveTo(sim, index);
    assert.equal(sim.toggleDoors().doorsOpen, true);
    finishDwellAndClose(sim);
  }
  assert.equal(sim.state.serviceCount, 5);
  assert.equal(sim.state.complete, true);
  assert.equal(sim.state.target, 4);
  assert.equal(sim.state.missed, false);
});

test("las puertas respetan dwell, movimiento y zona de parada", () => {
  const sim = createSimulation(stations);
  sim.start();
  assert.equal(
    sim.toggleDoors().doorsOpen,
    true,
    "no deben cerrar antes del dwell",
  );
  tickFor(sim, 3);
  assert.equal(sim.toggleDoors().doorsOpen, false);
  tickFor(sim, 1, { throttle: true });
  assert.equal(
    sim.toggleDoors().doorsOpen,
    false,
    "no deben abrir con el tren en marcha",
  );
  tickFor(sim, 1, { brake: true });
  assert.equal(
    sim.toggleDoors().doorsOpen,
    false,
    "no deben abrir fuera de la zona",
  );
});

test("pausa conserva posición y velocidad; emergencia desacelera", () => {
  const sim = startAtCanoAmarillo();
  tickFor(sim, 1, { throttle: true });
  const beforePause = sim.state;
  sim.pause(true);
  tickFor(sim, 2, { throttle: true });
  assert.equal(sim.state.position, beforePause.position);
  assert.equal(sim.state.speed, beforePause.speed);
  sim.pause(false);
  const beforeEmergency = sim.state.speed;
  sim.tick(0.05, { emergency: true });
  assert.ok(sim.state.speed < beforeEmergency);
  assert.ok(sim.state.speed >= 0);
});

test("una parada omitida bloquea tracción y recuperar aplica penalización", () => {
  const sim = startAtCanoAmarillo();
  tickFor(sim, 60, { throttle: true });
  assert.equal(sim.state.missed, true);
  const missedPosition = sim.state.position;
  const missedScore = sim.state.score;
  tickFor(sim, 100, { throttle: true });
  assert.equal(sim.state.target, 1);
  assert.equal(sim.state.speed, 0);
  assert.ok(sim.state.position >= missedPosition);
  const recovered = sim.recover();
  assert.equal(recovered.position, stations[1].distance);
  assert.equal(recovered.doorsOpen, true);
  assert.equal(recovered.score, missedScore - 15);
});

test("recuperar no mueve un tren que no ha omitido una parada", () => {
  const sim = startAtCanoAmarillo();
  const before = sim.state;
  const recovered = sim.recover();
  assert.equal(recovered.position, before.position);
  assert.equal(recovered.score, before.score);
  assert.equal(recovered.missed, false);
});
