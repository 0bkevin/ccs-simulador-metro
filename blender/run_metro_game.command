#!/bin/zsh
# Double-click this file in Finder to launch the playable Blender service.
set -e
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
exec /Applications/Blender.app/Contents/MacOS/Blender \
  "$PROJECT_DIR/blender/metro_caracas_line1.blend" \
  --python "$PROJECT_DIR/blender/metro_game.py"
