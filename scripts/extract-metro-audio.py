#!/usr/bin/env python3
"""Re-extract the documented excerpts from locally supplied source recordings.

Usage: python3 scripts/extract-metro-audio.py /path/to/source-videos
Source files must be named VIDEO_ID.mkv, .webm or .mp4. No downloader is run.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import struct
import subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source_directory', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
output = root / 'public/audio/recordings'
manifest_path = output / 'provenance.json'
manifest = json.loads(manifest_path.read_text())
for clip_id, clip in manifest['clips'].items():
    source = next((args.source_directory / (clip['source'] + ext) for ext in ['.mkv', '.webm', '.mp4']
                   if (args.source_directory / (clip['source'] + ext)).is_file()), None)
    if source is None:
        raise SystemExit(f"Missing source recording: {clip['source']}")
    duration = clip['end'] - clip['start']
    decode = ['ffmpeg', '-v', 'error', '-ss', str(clip['start']), '-i', str(source), '-t', str(duration), '-vn', '-ac', '1', '-ar', '44100']
    pcm = subprocess.check_output(decode + ['-f', 'f32le', '-'])
    samples = [s[0] for s in struct.iter_unpack('<f', pcm)]
    peak = max(map(abs, samples))
    rms = math.sqrt(sum(s*s for s in samples) / len(samples))
    # Constant gain preserves the recorded dynamics; cap peaks at -3 dBFS.
    level = min(0.12 / max(rms, 1e-9), 0.707 / max(peak, 1e-9), 8)
    filters = f'volume={level:.8f},afade=t=in:d=0.03,afade=t=out:st={duration-0.03:.4f}:d=0.03'
    path = output / clip['file']
    subprocess.run(decode + ['-af', filters, '-c:a', 'libmp3lame', '-b:a', '128k', '-map_metadata', '-1', '-y', str(path)], check=True)
    clip['normalizationGain'] = round(level, 8)
    clip['sha256'] = hashlib.sha256(path.read_bytes()).hexdigest()
    clip['bytes'] = path.stat().st_size
    print(f'{clip_id}: {duration:.2f}s, {path.stat().st_size} bytes')
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
