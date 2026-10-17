import React, { useEffect, useRef, useState } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";

// 2.5D camera move through a still: the depth map displaces the image per
// pixel (parallax occlusion), so near objects slide and grow more than far
// ones. Depth also drives fog, depth-of-field and rain that falls BETWEEN
// the layers (hidden behind near objects).
//
// With fg (an RGBA cutout of the subject) the subject is not warped: src is the
// clean plate, and the cutout is drawn as a flat card at fgDepth on top of it,
// so the camera moves around him without bending his body.

export type Cam = {
  x: number; // lateral camera offset (−1..1)
  y: number; // vertical camera offset (−1..1)
  zoom: number; // lens zoom, 1 = cover fit
  dolly: number; // camera travel into the scene (0 = none, + = forward)
};

export type DepthShotProps = {
  src: string;
  depth: string;
  fg?: string; // RGBA cutout of the subject
  fgDepth?: number; // depth of the subject's card (0 far … 1 near)
  cam: Cam;
  time: number; // seconds, for rain + flicker
  focus?: number; // depth that stays pinned (0 far … 1 near)
  fog?: number; // 0..1 fog in the far plane
  dof?: number; // blur strength away from focus
  rain?: number; // 0..1
  exposure?: number; // 1 = as shot
  width: number;
  height: number;
};

const VERT = `
attribute vec2 p;
varying vec2 vUv;
void main() { vUv = p * 0.5 + 0.5; vUv.y = 1.0 - vUv.y; gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uImg;
uniform sampler2D uDepth;
uniform sampler2D uFg;
uniform float uHasFg, uFgDepth;
uniform vec2 uCover;   // uv scale for cover fit
uniform vec2 uCam;
uniform float uZoom, uDolly, uFocus, uFog, uDof, uRain, uTime, uExposure;
uniform vec3 uFogColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

// map screen uv to image uv for a surface at depth l
vec2 project(vec2 uv, float l) {
  float k = l - uFocus;
  vec2 c = (uv - 0.5) / (uZoom * (1.0 + uDolly * k));
  return c * uCover + 0.5 - uCam * k * 0.06;
}

float rainLayer(vec2 uv, float scale, float speed, float seed) {
  uv.x += uv.y * 0.18;
  vec2 g = uv * vec2(scale, scale * 0.12);
  g.y -= uTime * speed;
  vec2 id = floor(g);
  vec2 f = fract(g);
  float r = hash(id + seed);
  float on = step(0.55, hash(id + seed + 7.3));
  float x = abs(f.x - (0.15 + 0.7 * r));
  float line = smoothstep(0.045, 0.0, x);
  float len = smoothstep(0.0, 0.35, f.y) * smoothstep(1.0, 0.55, f.y);
  return line * len * on;
}

void main() {
  // parallax occlusion: march layers near -> far, take the first surface hit
  const int STEPS = 48;
  vec2 hitUv = project(vUv, 0.0);
  float hitD = 0.0;
  for (int i = 0; i < STEPS; i++) {
    float l = 1.0 - float(i) / float(STEPS - 1);
    vec2 s = project(vUv, l);
    float d = texture2D(uDepth, s).r;
    if (d >= l) { hitUv = s; hitD = d; break; }
  }

  // depth of field: disc blur scaled by distance from focus
  float coc = abs(hitD - uFocus) * uDof;
  vec3 col = texture2D(uImg, hitUv).rgb;
  if (coc > 0.0005) {
    vec3 acc = col;
    for (int i = 0; i < 8; i++) {
      float a = float(i) * 0.785398;
      acc += texture2D(uImg, hitUv + vec2(cos(a), sin(a)) * coc * 0.012).rgb;
    }
    col = acc / 9.0;
  }

  // subject card: sharp, unwarped, composited at its own depth
  if (uHasFg > 0.5) {
    vec4 fg = texture2D(uFg, project(vUv, uFgDepth));
    col = mix(col, fg.rgb, fg.a);
    hitD = mix(hitD, uFgDepth, fg.a);
  }

  // atmospheric fog thickens with distance
  col = mix(col, uFogColor, (1.0 - hitD) * (1.0 - hitD) * uFog);

  // rain at three depths; a layer only shows where the scene is behind it
  float rain = 0.0;
  rain += rainLayer(project(vUv, 0.85), 26.0, 1.9, 1.0) * step(hitD, 0.85) * 0.55;
  rain += rainLayer(project(vUv, 0.55), 46.0, 1.4, 2.0) * step(hitD, 0.55) * 0.35;
  rain += rainLayer(project(vUv, 0.25), 80.0, 1.0, 3.0) * step(hitD, 0.25) * 0.22;
  col += vec3(0.75, 0.82, 0.9) * rain * uRain;

  gl_FragColor = vec4(col * uExposure, 1.0);
}`;

type GLState = {
  gl: WebGLRenderingContext;
  prog: WebGLProgram;
  imgSize: [number, number];
};

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${url}`));
    img.src = url;
  });

const compile = (gl: WebGLRenderingContext, type: number, src: string) => {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
  return s;
};

const texture = (gl: WebGLRenderingContext, unit: number, img: HTMLImageElement) => {
  const t = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
};

export const DepthShot: React.FC<DepthShotProps> = ({
  src,
  depth,
  fg,
  fgDepth = 0.8,
  cam,
  time,
  focus = 0.5,
  fog = 0.35,
  dof = 0.6,
  rain = 0.6,
  exposure = 1,
  width,
  height,
}) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<GLState | null>(null);
  const [handle] = useState(() => delayRender(`depth shot ${src}`));
  const released = useRef(false);

  useEffect(() => {
    const gl = canvas.current!.getContext("webgl", { preserveDrawingBuffer: true, antialias: false });
    if (!gl) {
      cancelRender(new Error("WebGL unavailable — render with --gl=angle or --gl=swangle"));
      return;
    }
    Promise.all([loadImage(src), loadImage(depth), fg ? loadImage(fg) : null])
      .then(([img, dep, fgImg]) => {
        const prog = gl.createProgram()!;
        gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
        gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(prog);
        gl.useProgram(prog);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, "p");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        texture(gl, 0, img);
        texture(gl, 1, dep);
        // straight (not premultiplied) alpha for the cutout
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        texture(gl, 2, fgImg ?? dep);
        gl.uniform1i(gl.getUniformLocation(prog, "uImg"), 0);
        gl.uniform1i(gl.getUniformLocation(prog, "uDepth"), 1);
        gl.uniform1i(gl.getUniformLocation(prog, "uFg"), 2);
        gl.uniform1f(gl.getUniformLocation(prog, "uHasFg"), fgImg ? 1 : 0);
        setState({ gl, prog, imgSize: [img.naturalWidth, img.naturalHeight] });
      })
      .catch((err) => cancelRender(err));
  }, [src, depth, fg]);

  useEffect(() => {
    if (!state) return;
    const { gl, prog, imgSize } = state;
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const canvasAR = width / height;
    const imgAR = imgSize[0] / imgSize[1];
    // cover fit with 6% overscan so camera moves never reveal the border
    const over = 1 / 1.06;
    const cover: [number, number] = canvasAR > imgAR ? [over, (imgAR / canvasAR) * over] : [(canvasAR / imgAR) * over, over];
    gl.viewport(0, 0, width, height);
    gl.uniform2f(u("uCover"), cover[0], cover[1]);
    gl.uniform2f(u("uCam"), cam.x, cam.y);
    gl.uniform1f(u("uZoom"), cam.zoom);
    gl.uniform1f(u("uDolly"), cam.dolly);
    gl.uniform1f(u("uFocus"), focus);
    gl.uniform1f(u("uFgDepth"), fgDepth);
    gl.uniform1f(u("uFog"), fog);
    gl.uniform1f(u("uDof"), dof);
    gl.uniform1f(u("uRain"), rain);
    gl.uniform1f(u("uTime"), time);
    gl.uniform1f(u("uExposure"), exposure);
    gl.uniform3f(u("uFogColor"), 0.07, 0.1, 0.14);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!released.current) {
      released.current = true;
      continueRender(handle);
    }
  }, [state, cam.x, cam.y, cam.zoom, cam.dolly, time, focus, fgDepth, fog, dof, rain, exposure, width, height, handle]);

  return <canvas ref={canvas} width={width} height={height} style={{ position: "absolute", inset: 0 }} />;
};
