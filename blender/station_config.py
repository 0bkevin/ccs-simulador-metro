"""Shared metre datums consumed by Blender, the exporter and browser views."""
import json
from pathlib import Path
SPEC = json.loads((Path(__file__).resolve().parent.parent / 'public/models/station-specs.json').read_text())
STATIONS = SPEC['stations']
STOPS = {s['name']: s['distance'] for s in STATIONS}
BY_NAME = {s['name']: s for s in STATIONS}
TUNNEL = SPEC['tunnel']
