"""Playable Line 1 driving mode for metro_caracas_line1.blend.

Run from Blender's Python Console or command line after opening the .blend:

    blender blender/metro_caracas_line1.blend --python blender/metro_game.py

Controls while the Blender 3D View is focused:
    W / Up       traction
    S / Down     brake
    E            open/close doors at a station
    P            pause
    R            reset service
    Esc          exit driving mode

Blender no longer ships a game engine, so this uses a modal timer operator:
the authored geometry stays native Blender data and the service is playable
inside the Blender viewport.
"""

import bpy
import math
import os
from mathutils import Vector


ROUTE = [
    ("Caño Amarillo", 0),
    ("Capitolio", 160),
    ("Bellas Artes", 320),
    ("Plaza Venezuela", 480),
    ("Altamira", 640),
]
MAX_SPEED = 18.0
STOP_ZONE = 5.0


def look_at(obj, target):
    # The authored Blender scene uses world Y as vertical and world Z as the
    # route direction. Tracking local Z preserves a level exterior camera;
    # using local Y here would roll the side view ninety degrees.
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Z").to_euler()


def status(scene, message):
    scene["metro_game_status"] = message
    if bpy.context.workspace:
        bpy.context.workspace.status_text_set(message)


def train_root():
    root = bpy.data.objects.get("Metro Game Train")
    if root:
        return root
    root = bpy.data.objects.new("Metro Game Train", None)
    bpy.context.scene.collection.objects.link(root)
    root.empty_display_type = "PLAIN_AXES"
    root.empty_display_size = 2.0
    for collection in bpy.data.collections:
        if not collection.name.startswith("CAF car "):
            continue
        for obj in list(collection.objects):
            world = obj.matrix_world.copy()
            obj.parent = root
            obj.matrix_world = world
    return root


def setup_camera(root):
    camera = bpy.data.objects.get("Metro exterior review camera")
    if not camera:
        bpy.ops.object.camera_add()
        camera = bpy.context.object
        camera.name = "Metro exterior review camera"
    # Keep the camera in world space; only its position follows the train.
    # Parenting it and then aiming at world coordinates causes a doubled
    # transform once the consist starts moving.
    camera.parent = None
    camera.location = root.location + Vector((18, 7.5, 12))
    look_at(camera, root.location + Vector((0, 2.0, -32)))
    bpy.context.scene.camera = camera
    return camera


class METRO_OT_play(bpy.types.Operator):
    bl_idname = "metro.play"
    bl_label = "Play Caracas Metro Line 1"
    bl_options = {"REGISTER"}

    _timer = None
    speed = 0.0
    distance = 0.0
    station_index = 0
    doors_open = True
    paused = False
    throttle = False
    brake = False
    serviced = 0
    missed = False

    def invoke(self, context, event):
        if self._timer:
            return {"CANCELLED"}
        self.root = train_root()
        self.camera = setup_camera(self.root)
        self.reset_state(context.scene)
        self._timer = context.window_manager.event_timer_add(.033, window=context.window)
        context.window_manager.modal_handler_add(self)
        status(context.scene, "METRO L1 | W/↑ tracción · S/↓ freno · E puertas · P pausa · R reiniciar · Esc salir")
        return {"RUNNING_MODAL"}

    def reset_state(self, scene):
        self.speed = 0.0
        self.distance = 0.0
        self.station_index = 0
        self.doors_open = True
        self.paused = False
        self.throttle = False
        self.brake = False
        self.serviced = 0
        self.missed = False
        self.root.location = (0, 0, 0)
        self.update_camera()
        status(scene, "Caño Amarillo · puertas abiertas · pulsa E para cerrar y salir")

    def update_camera(self):
        if not self.camera:
            return
        # The camera is parented to the train, so its local z follows the cab.
        self.camera.location = self.root.location + Vector((18, 7.5, 12))
        look_at(self.camera, self.root.location + Vector((0, 2.0, -32)))

    def station_name(self):
        return ROUTE[min(self.station_index, len(ROUTE) - 1)][0]

    def near_station(self):
        target = ROUTE[min(self.station_index, len(ROUTE) - 1)][1]
        return abs(self.distance - target) <= STOP_ZONE

    def tick(self, scene, dt):
        if self.paused:
            return
        if self.throttle and not self.doors_open and not self.missed:
            self.speed = min(MAX_SPEED, self.speed + 4.0 * dt)
        elif self.brake:
            self.speed = max(0.0, self.speed - 8.0 * dt)
        else:
            self.speed = max(0.0, self.speed - .45 * dt)
        self.distance += self.speed * dt
        self.root.location.z = self.distance
        target = ROUTE[min(self.station_index, len(ROUTE) - 1)][1]
        if self.station_index < len(ROUTE) and self.distance > target + STOP_ZONE and self.speed > 0.2:
            self.missed = True
            self.throttle = False
            status(scene, f"PARADA OMITIDA: {self.station_name()} · pulsa R para reiniciar")
        if not self.missed and self.near_station() and self.speed < .15:
            self.speed = 0.0
            if self.doors_open:
                status(scene, f"{self.station_name()} · puertas abiertas · E para cerrar")
            else:
                status(scene, f"{self.station_name()} · puertas cerradas · W/↑ para continuar")
        elif not self.missed:
            nxt = self.station_name()
            status(scene, f"L1 → {nxt} | velocidad {self.speed * 3.6:02.0f} km/h | distancia {self.distance:03.0f} m")

        if self.station_index == len(ROUTE) - 1 and self.serviced >= len(ROUTE) and self.distance >= ROUTE[-1][1] - STOP_ZONE:
            status(scene, "SERVICIO COMPLETO · Altamira · pulsa R para otro recorrido")

    def modal(self, context, event):
        if event.type == "TIMER":
            self.tick(context.scene, .033)
            return {"RUNNING_MODAL"}
        if event.value == "PRESS":
            if event.type in {"W", "UP_ARROW"}:
                self.throttle = True
            elif event.type in {"S", "DOWN_ARROW"}:
                self.brake = True
            elif event.type == "E":
                if self.speed < .15 and self.near_station() and not self.missed:
                    if self.doors_open:
                        self.doors_open = False
                        self.serviced += 1
                        if self.station_index < len(ROUTE) - 1:
                            self.station_index += 1
                        status(context.scene, f"{self.station_name()} · puertas cerradas · W/↑ para tracción")
                    else:
                        self.doors_open = True
                        status(context.scene, f"{self.station_name()} · puertas abiertas")
            elif event.type == "P":
                self.paused = not self.paused
                status(context.scene, "PAUSA" if self.paused else "SERVICIO REANUDADO")
            elif event.type == "R":
                self.reset_state(context.scene)
            elif event.type == "ESC":
                self.cancel(context)
                return {"CANCELLED"}
        elif event.value == "RELEASE":
            if event.type in {"W", "UP_ARROW"}:
                self.throttle = False
            elif event.type in {"S", "DOWN_ARROW"}:
                self.brake = False
        return {"RUNNING_MODAL"}

    def cancel(self, context):
        if self._timer:
            context.window_manager.event_timer_remove(self._timer)
            self._timer = None
        status(context.scene, "Modo conducción detenido · ejecuta Metro > Play Caracas Metro para volver")


def menu_item(self, context):
    self.layout.operator(METRO_OT_play.bl_idname, icon="PLAY")


def register():
    if not hasattr(bpy.types, "METRO_OT_play"):
        bpy.utils.register_class(METRO_OT_play)
        bpy.types.TOPBAR_MT_editor_menus.append(menu_item)


def unregister():
    if hasattr(bpy.types, "METRO_OT_play"):
        bpy.types.TOPBAR_MT_editor_menus.remove(menu_item)
        bpy.utils.unregister_class(METRO_OT_play)


register()


def _start_in_blender_window():
    """Start after Blender has created its first UI window.

    A command-line script runs before the initial 3D View context is ready;
    delaying the operator avoids Blender's "invalid operator call" and still
    gives a normal interactive launch. In background mode this is skipped.
    """
    if bpy.app.background:
        return None
    windows = list(bpy.context.window_manager.windows) if bpy.context.window_manager else []
    if not windows:
        return .5
    try:
        with bpy.context.temp_override(window=windows[0]):
            bpy.ops.metro.play("INVOKE_DEFAULT")
    except RuntimeError:
        # The operator remains available through F3 if Blender is still
        # finishing workspace initialization.
        return None
    return None


bpy.app.timers.register(_start_in_blender_window, first_interval=1.0)
