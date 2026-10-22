"""Build the ClawdEdit Blender scene from blender/build/motion.json + the exported textures.

    blender -b --factory-startup -P blender/scene.py -- [--build blender/build]
    python blender/scene.py [--build blender/build]          # with `pip install bpy`

Everything animated is BAKED from the same motion.ts the Remotion scene uses (one key per
frame), so timing, hops, camera and props match the CPU render exactly. This script only adds
what a path tracer does better: real area/sun light, soft shadows, glossy bounce, lens DOF,
0.5-shutter motion blur, AgX, and a glare pass.

All objects live under one empty, ROOT, rotated +90° on X: inside it the coordinates ARE
three.js coordinates (Y up), so nothing is converted per object. Rotations use mode 'ZYX',
which is three.js's 'XYZ' order.
"""
import json
import math
import os
import sys

import bpy
from mathutils import Matrix, Quaternion, Vector

ARGV = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]


def arg(name, default):
    return ARGV[ARGV.index(name) + 1] if name in ARGV else default


HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.abspath(arg("--build", os.path.join(HERE, "build")))
DATA = json.load(open(os.path.join(BUILD, "motion.json")))
META, FR = DATA["meta"], DATA["frames"]
N = META["frames"]
UI_PNG = os.path.join(BUILD, "ui.png")
COMP_DIR = os.path.join(BUILD, "comp")
HERO = (0xD9 / 255, 0x77 / 255, 0x57 / 255)  # #D97757 — measure the render with qc.py color

# ------------------------------------------------------------------ reset
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.fps = META["fps"]
scene.frame_start, scene.frame_end = 1, N
scene.render.resolution_x, scene.render.resolution_y = 1920, 1080


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def lin(rgb):
    return tuple(srgb_to_linear(c) for c in rgb) + (1.0,)


def hexc(h):
    h = h.lstrip("#")
    return lin(tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)))


# ------------------------------------------------------------------ baking helpers
def fcurve(idblock, path, index):
    if idblock.animation_data is None:
        idblock.animation_data_create()
    ad = idblock.animation_data
    if ad.action is None:
        ad.action = bpy.data.actions.new(f"{idblock.name}_bake")
    act = ad.action
    if hasattr(act, "fcurve_ensure_for_datablock"):  # Blender ≥4.4 slotted actions
        return act.fcurve_ensure_for_datablock(idblock, path, index=index)
    fc = act.fcurves.find(path, index=index)
    return fc or act.fcurves.new(path, index=index)


def bake(idblock, path, values, index=0, constant=False):
    """One key per frame. values[f] for frame f (0-based) → Blender frame f+1."""
    fc = fcurve(idblock, path, index)
    fc.keyframe_points.clear()
    fc.keyframe_points.add(len(values))
    co = []
    for f, v in enumerate(values):
        co += [f + 1, float(v)]
    fc.keyframe_points.foreach_set("co", co)
    interp = 0 if constant else 1  # CONSTANT / LINEAR
    fc.keyframe_points.foreach_set("interpolation", [interp] * len(values))
    fc.update()


def bake_vec(idblock, path, rows, size=3, constant=False):
    for i in range(size):
        bake(idblock, path, [r[i] for r in rows], i, constant)


# ------------------------------------------------------------------ geometry helpers
def mesh_obj(name, verts, faces, uvs=None, parent=None):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    if uvs:
        uv = me.uv_layers.new(name="UVMap")
        for li, loop in enumerate(me.loops):
            uv.data[li].uv = uvs[loop.vertex_index]
    me.update()
    ob = bpy.data.objects.new(name, me)
    scene.collection.objects.link(ob)
    ob.rotation_mode = "ZYX"
    if parent:
        ob.parent = parent
    return ob


def box(name, size, loc=(0, 0, 0), mat=None, parent=None, bevel=0.0):
    x, y, z = (s / 2 for s in size)
    v = [(-x, -y, -z), (x, -y, -z), (x, y, -z), (-x, y, -z), (-x, -y, z), (x, -y, z), (x, y, z), (-x, y, z)]
    f = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    ob = mesh_obj(name, v, f, parent=parent)
    ob.location = loc
    if mat:
        ob.data.materials.append(mat)
    if bevel > 0:
        m = ob.modifiers.new("bevel", "BEVEL")
        m.width, m.segments, m.limit_method = bevel, 3, "NONE"
        ob.modifiers.new("smooth", "WEIGHTED_NORMAL")
    return ob


def plane_xz(name, w, d, uv_rect=(0, 0, 1, 1), parent=None):
    """A plane lying in three.js XZ, normal +Y. uv_rect = (u0, v_bottom, u1, v_top)."""
    u0, vb, u1, vt = uv_rect
    v = [(-w / 2, 0, -d / 2), (-w / 2, 0, d / 2), (w / 2, 0, d / 2), (w / 2, 0, -d / 2)]
    uvs = [(u0, vt), (u0, vb), (u1, vb), (u1, vt)]
    return mesh_obj(name, v, [(0, 1, 2, 3)], uvs, parent)


def empty(name, parent=None):
    ob = bpy.data.objects.new(name, None)
    scene.collection.objects.link(ob)
    ob.rotation_mode = "ZYX"
    if parent:
        ob.parent = parent
    return ob


# ------------------------------------------------------------------ materials
def principled(name, color, rough=0.5, coat=0.0, emit=None, strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = color
    b.inputs["Roughness"].default_value = rough
    if coat:
        b.inputs["Coat Weight"].default_value = coat
        b.inputs["Coat Roughness"].default_value = 0.3
    if emit:
        b.inputs["Emission Color"].default_value = emit
        b.inputs["Emission Strength"].default_value = strength
    return m


def screen_material(name, image, gain=1.0, sequence=False):
    """LOOK: the screen is emission under black glass, with low specular so the lights never
    mirror on it as white blocks. Strength = object["power"] * gain (baked per object)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (0.004, 0.004, 0.004, 1)
    b.inputs["Roughness"].default_value = 0.32
    b.inputs["Specular IOR Level"].default_value = 0.1
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = image
    tex.interpolation = "Smart"
    if sequence:
        tex.image_user.frame_duration = N
        tex.image_user.frame_start = 1
        tex.image_user.frame_offset = -1  # element-000.png is scene frame 1
        tex.image_user.use_auto_refresh = True
    attr = nt.nodes.new("ShaderNodeAttribute")
    attr.attribute_type = "OBJECT"
    attr.attribute_name = "power"
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    mul.inputs[1].default_value = gain
    nt.links.new(attr.outputs["Fac"], mul.inputs[0])
    nt.links.new(tex.outputs["Color"], b.inputs["Emission Color"])
    nt.links.new(mul.outputs[0], b.inputs["Emission Strength"])
    return m


def emitter(name, rgb, strength):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.remove(nt.nodes["Principled BSDF"])
    e = nt.nodes.new("ShaderNodeEmission")
    e.inputs["Color"].default_value = rgb
    attr = nt.nodes.new("ShaderNodeAttribute")
    attr.attribute_type = "OBJECT"
    attr.attribute_name = "power"
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    mul.inputs[1].default_value = strength
    nt.links.new(attr.outputs["Fac"], mul.inputs[0])
    nt.links.new(mul.outputs[0], e.inputs["Strength"])
    nt.links.new(e.outputs[0], nt.nodes["Material Output"].inputs["Surface"])
    return m


def power(ob, values):
    ob["power"] = 1.0
    bake(ob, '["power"]', values)


# ------------------------------------------------------------------ the world in three.js space
ROOT = empty("ROOT")
ROOT.rotation_mode = "XYZ"
ROOT.rotation_euler = (math.pi / 2, 0, 0)

W, H = META["app"]["w"], META["app"]["h"]
PPU = META["pxPerUnit"]
SLAB, BTN = META["slab"], META["btn"]


def px(x, y):
    return (x - W / 2) / PPU, (y - H / 2) / PPU


def uv_of(r):
    return (r["x"] / W, 1 - (r["y"] + r["h"]) / H, (r["x"] + r["w"]) / W, 1 - r["y"] / H)


ui_img = bpy.data.images.load(UI_PNG)
first = sorted(f for f in os.listdir(COMP_DIR) if f.endswith(".png"))[0]
comp_img = bpy.data.images.load(os.path.join(COMP_DIR, first))
comp_img.source = "SEQUENCE"

slab_mat = principled("slab_body", hexc("#151413"), rough=0.35)


def slab(name, r, mat, thick, parent, uv=None):
    cx, cz = px(r["x"] + r["w"] / 2, r["y"] + r["h"] / 2)
    g = empty(name, parent)
    g.location = (cx, 0, cz)
    box(f"{name}_body", (r["w"] / PPU, thick, r["h"] / PPU), (0, -thick / 2, 0), slab_mat, g)
    top = plane_xz(f"{name}_screen", r["w"] / PPU, r["h"] / PPU, uv or uv_of(r), g)
    top.location = (0, 0.001, 0)
    top.data.materials.append(mat)
    return g, top


def bake_fall(g, rows, base_y=0.0):
    bake_vec(g, "location", [(g.location[0], base_y - s["drop"] - s.get("dip", 0), g.location[2]) for s in rows])
    bake_vec(g, "rotation_euler", [(s["tilt"], 0, s["tilt"] * 0.4) for s in rows])


ui_mat = screen_material("ui", ui_img, 1.0)
for key, r in META["panels"].items():
    g, top = slab(f"panel_{key}", r, ui_mat, SLAB, ROOT)
    rows = [fr["panels"][key] for fr in FR]
    bake_fall(g, rows)
    power(top, [s["power"] for s in rows])

vr = META["viewer"]
# the comp frames ARE the viewer, so it maps the whole image (not a crop of ui.png)
g, top = slab("viewer", vr, screen_material("comp", comp_img, 1.35, sequence=True), 0.01, ROOT, uv=(0, 0, 1, 1))
g.location[1] = 0.003
top["power"] = 1.0

for key, r in META["buttons"].items():
    g, top = slab(f"key_{key}", r, ui_mat, BTN, ROOT)
    rows = [fr["buttons"][key] for fr in FR]
    bake_fall(g, rows, BTN)
    power(top, [s["power"] * (1 + 0.9 * s["lit"]) for s in rows])

# timeline props: keyframe cubes + the playhead, falling with the timeline
tl = empty("timeline_props", ROOT)
bake_fall(tl, [fr["panels"]["timeline"] for fr in FR])
key_mat = emitter("keyframe", (1, 1, 1, 1), 1.6)
for i in range(META["keyCount"]):
    c = box(f"keyframe_{i}", (0.2, 0.2, 0.2), (0, 0, 0), key_mat, tl)
    c.rotation_euler = (0, math.pi / 4, 0)
    rows = [fr["keys"][i] for fr in FR]
    bake_vec(c, "location", [(k["pos"][0], k["pos"][1] + 0.12 * k["scale"], k["pos"][2]) for k in rows])
    bake_vec(c, "scale", [(k["scale"],) * 3 for k in rows])
    power(c, [fr["panels"]["timeline"]["power"] for fr in FR])
tr = META["timelineRect"]
beam_len = (tr["y"] + tr["h"] - META["rulerY"]) / PPU
beam = box("playhead_beam", (0.06, 0.05, beam_len), (0, 0, 0), emitter("cti_beam", hexc("#5fb4ff"), 2.6), tl)
head = box("playhead_head", (0.3, 0.16, 0.34), (0, 0, 0), emitter("cti_head", hexc("#8cc8ff"), 1.4), tl, bevel=0.02)
bake_vec(beam, "location", [(fr["playhead"]["x"], SLAB + 0.025, fr["playhead"]["z"] + beam_len / 2) for fr in FR])
bake_vec(head, "location", [(fr["playhead"]["x"], SLAB + 0.08, fr["playhead"]["z"]) for fr in FR])
for o in (beam, head):
    power(o, [fr["panels"]["timeline"]["power"] for fr in FR])

# Effects > Glow chip
gr = META["buttons"]["glow"]
chip = plane_xz("glow_chip", 3.0, 0.48, uv_of(gr), ROOT)
chip.data.materials.append(screen_material("chip", ui_img, 2.4))
chip.rotation_mode = "ZYX"
rows = [fr["chip"] or {"pos": [0, -50, 0], "rot": [0, 0, 0], "scale": 0} for fr in FR]
bake_vec(chip, "location", [c["pos"] for c in rows])
# chip is a plane in XZ; the scene's planeGeometry is in XY rotated by rot, so add +90° on X
bake_vec(chip, "rotation_euler", [(c["rot"][0] + math.pi / 2, c["rot"][1], c["rot"][2]) for c in rows])
bake_vec(chip, "scale", [(c["scale"],) * 3 for c in rows])
power(chip, [1.0] * N)

# pop shards + ring
shard_mat = emitter("shard", (1, 0.96, 0.92, 1), 2.1)
for i in range(META["shardCount"]):
    first_live = next(fr["shards"] for fr in FR if fr["shards"])
    sz = first_live["items"][i]["size"]
    s = box(f"shard_{i}", sz, (0, 0, 0), shard_mat, ROOT)
    rows = [fr["shards"] for fr in FR]
    bake_vec(s, "location", [r["items"][i]["pos"] if r else (0, -50, 0) for r in rows])
    bake_vec(s, "rotation_euler", [r["items"][i]["rot"] if r else (0, 0, 0) for r in rows])
    bake_vec(s, "scale", [(1,) * 3 if r else (0,) * 3 for r in rows], constant=True)
    power(s, [r["fade"] if r else 0 for r in [fr["shards"] for fr in FR]])

# ------------------------------------------------------------------ Clawd (same build as ClawdModel)
CW, CH, CD = 2.4, 1.6, 1.25
LEG_H, LEG_W, LEG_X = 0.42, 0.17, [-0.82, -0.4, 0.4, 0.82]
ARM = dict(out=0.32, h=0.4, d=0.6, y=LEG_H + CH * 0.42)
EYE = dict(x=0.42, y=LEG_H + CH * 0.58, w=0.13, h=0.32)
plastic = principled("clawd", lin(HERO), rough=0.42, coat=0.4)
ink = principled("ink", (0.006, 0.006, 0.006, 1), rough=0.12)

c_flat = empty("clawd_flat", ROOT)  # position + "flat PNG" squash in world Y
c_lie = empty("clawd_lie", c_flat)  # lying face-up → standing
c_lie.scale = (META["clawdScale"],) * 3
c_rig = empty("clawd_rig", c_lie)  # rig.rot
c_lean = empty("clawd_lean", c_rig)  # lean + squash/stretch
# the body's bevel is ~10% of its height: a smooth toy, not a voxel block
box("clawd_body", (CW, CH, CD), (0, LEG_H + CH / 2, 0), plastic, c_lean, bevel=0.16)
eyes, happy = [], []
for s in (-1, 1):
    e = box(f"clawd_eye_{s}", (EYE["w"], EYE["h"], 0.03), (s * EYE["x"], EYE["y"], CD / 2 + 0.01), ink, c_lean)
    eyes.append(e)
    hg = empty(f"clawd_happy_{s}", c_lean)
    hg.location = (s * EYE["x"], EYE["y"], CD / 2 + 0.012)
    d = 1 if s == -1 else -1
    for b in (1, -1):
        bar = box(f"clawd_chev_{s}_{b}", (0.22, 0.075, 0.03), (0, b * 0.072, 0), ink, hg)
        bar.rotation_euler = (0, 0, b * d * -0.62)
    happy.append(hg)
arms = {}
for s in (-1, 1):
    g = empty(f"clawd_arm_{s}", c_lean)
    g.location = (s * CW / 2, ARM["y"], 0)
    box(f"clawd_arm_{s}_block", (ARM["out"] + 0.06, ARM["h"], ARM["d"]), (s * (ARM["out"] / 2 - 0.03), 0, 0), plastic, g, bevel=0.05)
    arms[s] = g
legs = []
for x in LEG_X:
    g = empty(f"clawd_leg_{x}", c_lean)
    for z in (-1, 1):
        box(f"clawd_leg_{x}_{z}", (LEG_W, LEG_H + 0.04, LEG_W), (0, -LEG_H / 2, z * (CD / 2 - 0.2)), plastic, g, bevel=0.03)
    legs.append((x, g))

C = [fr["clawd"] for fr in FR]
bake_vec(c_flat, "location", [c["pos"] for c in C])
bake_vec(c_flat, "scale", [(1, 1 - c["flat"] * 0.93, 1) for c in C])
bake_vec(c_lie, "rotation_euler", [(-math.pi / 2 * c["lie"], 0, 0) for c in C])
bake_vec(c_rig, "rotation_euler", [c["rot"] for c in C])
bake_vec(c_lean, "rotation_euler", [(c["lean"], 0, 0) for c in C])
bake_vec(c_lean, "scale", [(c["sx"], c["sy"], c["sx"]) for c in C])
for e in eyes:
    bake_vec(e, "scale", [(1, 0 if c["happy"] else max(0.12, 1 - c["blink"]), 1) for c in C], constant=True)
for hg in happy:
    bake_vec(hg, "scale", [(1,) * 3 if c["happy"] else (0,) * 3 for c in C], constant=True)
for s, g in arms.items():
    bake_vec(g, "rotation_euler", [(0, 0, s * (c["armL"] if s < 0 else c["armR"])) for c in C])
for x, g in legs:
    side = "legL" if x < 0 else "legR"
    sg = -1 if x < 0 else 1
    bake_vec(g, "location", [(x, LEG_H + c[side]["lift"] * 0.24, c[side]["slide"]) for c in C])
    bake_vec(g, "rotation_euler", [(c[side]["tip"], 0, sg * c[side]["kick"]) for c in C])
    bake_vec(g, "scale", [(1, 1 + c[side].get("stretch", 0), 1) for c in C])

# ------------------------------------------------------------------ the room + lights (three.js space)
table = plane_xz("table", 80, 60, parent=ROOT)
table.location = (0, -1.4, 0)
table.data.materials.append(principled("table", hexc("#5a3e30"), rough=0.92))
wall = mesh_obj("wall", [(-40, -2, -10), (40, -2, -10), (40, 16, -10), (-40, 16, -10)], [(0, 1, 2, 3)], parent=ROOT)
wall.data.materials.append(principled("wall", hexc("#4e362a"), rough=0.95))


def light(name, kind, pos, target, energy, color, **kw):
    ld = bpy.data.lights.new(name, kind)
    ld.energy, ld.color = energy, color
    for k, v in kw.items():
        setattr(ld, k, v)
    ob = bpy.data.objects.new(name, ld)
    scene.collection.objects.link(ob)
    ob.parent = ROOT
    ob.location = pos
    ob.rotation_mode = "QUATERNION"
    ob.rotation_quaternion = (Vector(target) - Vector(pos)).to_track_quat("-Z", "Y")
    return ob


light("key", "SUN", (-5, 11, 7), (0, 0, 0), 3.2, (1, 0.89, 0.78), angle=math.radians(4))
light("rim", "SUN", (7, 3, -6), (0, 0, 0), 1.6, (0.56, 0.72, 1.0), angle=math.radians(8))
room = light("room", "SPOT", (1, 8, 4), (0, 2, -10), 4500, (1, 0.73, 0.54), spot_size=math.radians(85), spot_blend=0.9)
fill = light("hero_fill", "POINT", (0, 0, 0), (0, -1, 0), 25, (1, 0.9, 0.84), shadow_soft_size=0.3)
bake_vec(fill, "location", [(c["body"][0] + 0.7, c["body"][1] + 1.1, c["body"][2] + 1.3) for c in C])
spill = light("screen_spill", "POINT", (0, 0, 0), (0, -1, 0), 6, (0.62, 0.78, 1.0), shadow_soft_size=0.4)
bake_vec(spill, "location", [(c["body"][0], c["body"][1] - 0.15, c["body"][2] + 0.4) for c in C])

world = bpy.data.worlds.new("studio")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = hexc("#2a1d16")
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.35

# ------------------------------------------------------------------ camera from the shot list
cam_data = bpy.data.cameras.new("cam")
cam = bpy.data.objects.new("cam", cam_data)
scene.collection.objects.link(cam)
cam.parent = ROOT
cam.rotation_mode = "QUATERNION"
scene.camera = cam
cam_data.sensor_fit = "VERTICAL"
cam_data.sensor_height = 24
cam_data.clip_start, cam_data.clip_end = 0.05, 80
cam_data.dof.use_dof = True
cam_data.dof.aperture_fstop = float(arg("--fstop", 1.2))  # the macro look; raise for more in focus

quats, prev = [], None
for fr in FR:
    c = fr["camera"]
    pos, look = Vector(c["pos"]), Vector(c["look"])
    f = (look - pos).normalized()
    right = f.cross(Vector((0, 1, 0))).normalized()
    up = right.cross(f)
    cr, sr = math.cos(c["roll"]), math.sin(c["roll"])
    right, up = right * cr + up * sr, -right * sr + up * cr  # three.js camera.rotateZ(roll)
    m = Matrix((right, up, -f)).transposed()
    q = m.to_quaternion()
    if prev is not None and q.dot(prev) < 0:
        q = -q  # keep the shortest path between per-frame keys
    quats.append(q)
    prev = q
bake_vec(cam, "location", [fr["camera"]["pos"] for fr in FR])
bake_vec(cam, "rotation_quaternion", [tuple(q) for q in quats], size=4)
bake(cam_data, "lens", [12 / math.tan(math.radians(fr["camera"]["fov"]) / 2) for fr in FR])
bake(cam_data, "dof.focus_distance", [fr["camera"]["focus"] for fr in FR])

# ------------------------------------------------------------------ look: AgX, motion blur, glare
vs = scene.view_settings
vs.view_transform = "AgX"
for look in ("AgX - Medium High Contrast", "Medium High Contrast"):
    try:
        vs.look = look
        break
    except TypeError:
        pass
vs.exposure = -0.3  # the guide's lesson: AgX lightens the hero; lower exposure, then measure
scene.render.use_motion_blur = True
scene.render.motion_blur_shutter = 0.5


def glare():
    """Bloom on the HDR emitters (keyframes, playhead, the glowing title)."""
    if hasattr(scene, "compositing_node_group"):  # Blender ≥5.0
        tree = bpy.data.node_groups.new("bloom", "CompositorNodeTree")
        scene.compositing_node_group = tree
        rl = tree.nodes.new("CompositorNodeRLayers")
        out = tree.nodes.new("NodeGroupOutput")
        tree.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    else:
        scene.use_nodes = True
        tree = scene.node_tree
        tree.nodes.clear()
        rl = tree.nodes.new("CompositorNodeRLayers")
        out = tree.nodes.new("CompositorNodeComposite")
    g = tree.nodes.new("CompositorNodeGlare")
    if "Type" in g.inputs:  # ≥5.0: settings are sockets
        g.inputs["Type"].default_value = "Fog Glow"
        g.inputs["Threshold"].default_value = 1.0
        if "Strength" in g.inputs:
            g.inputs["Strength"].default_value = 0.6
    else:
        g.glare_type, g.threshold, g.mix = "FOG_GLOW", 1.0, -0.4
    tree.links.new(rl.outputs["Image"], g.inputs["Image"])
    tree.links.new(g.outputs["Image"], out.inputs[0])


try:
    glare()
except Exception as e:  # the film still renders without bloom
    print("glare node skipped:", e)

out = os.path.join(BUILD, "clawdedit.blend")
bpy.ops.wm.save_as_mainfile(filepath=out)
print(f"saved {out}: {N} frames baked")
