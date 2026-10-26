"use client";

import { Canvas, useFrame, useThree, type RootState } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const RADIUS = 1.5;
const RING_POINTS = 1800;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uAmp;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vNoise;

  // Simplex noise by Ian McEwan, Ashima Arts (MIT).
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  float displace(vec3 p) {
    vec3 q = p * 0.75 + vec3(uTime * 0.16, uTime * 0.11, -uTime * 0.13);
    q.xy += uPointer * 0.35;
    return snoise(q) * uAmp;
  }

  void main() {
    vec3 dir = normalize(position);
    float d = displace(position);
    vec3 p = position + dir * d;

    // Rebuild the normal from two displaced neighbours.
    vec3 t = normalize(cross(dir, abs(dir.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
    vec3 b = normalize(cross(dir, t));
    vec3 pa = position + t * 0.03;
    vec3 pb = position + b * 0.03;
    pa = pa + normalize(pa) * displace(pa);
    pb = pb + normalize(pb) * displace(pb);
    vec3 n = normalize(cross(pa - p, pb - p));
    if (dot(n, dir) < 0.0) n = -n;

    vNormal = normalize(normalMatrix * n);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vView = -mv.xyz;
    vNoise = d / max(uAmp, 0.0001);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uRim;
  uniform float uDark;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vNoise;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vView);
    vec3 L = normalize(vec3(-0.55, 0.8, 0.65));

    float diff = max(dot(N, L), 0.0);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 2.4);
    float mixAmt = clamp(smoothstep(-1.0, 1.0, vNoise) * 0.75 + N.y * 0.25 + 0.1, 0.0, 1.0);

    vec3 col = mix(uA, uB, mixAmt) * (0.5 + 0.7 * diff);
    vec3 H = normalize(L + V);
    col += pow(max(dot(N, H), 0.0), 56.0) * 0.5;
    col = mix(col, uRim, fres * (0.45 + 0.4 * uDark));

    gl_FragColor = vec4(col, uOpacity);
    #include <colorspace_fragment>
  }
`;

type SceneColors = { a: THREE.Color; b: THREE.Color; rim: THREE.Color; dots: THREE.Color };

function readColors(): SceneColors {
  const style = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) =>
    new THREE.Color(style.getPropertyValue(name).trim() || fallback);
  return {
    a: get("--scene-a", "#1d5fd8"),
    b: get("--scene-b", "#3fb7ff"),
    rim: get("--scene-rim", "#cdeeff"),
    dots: get("--scene-dots", "#1f6fe0"),
  };
}

function applyTheme(
  material: THREE.ShaderMaterial,
  ringMaterial: THREE.PointsMaterial,
  dark: boolean,
) {
  const c = readColors();
  const u = material.uniforms;
  u.uA.value.copy(c.a);
  u.uB.value.copy(c.b);
  u.uRim.value.copy(c.rim);
  u.uDark.value = dark ? 1 : 0;
  ringMaterial.color.copy(c.dots);
}

/** Deterministic 0..1 noise so the ring looks the same on every render. */
function hash(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

type Pose = { x: number; y: number; scale: number; amp: number; opacity: number };

const SECTION_IDS = ["top", "work", "skills", "path", "contact"] as const;

/** Where the orb sits in each section, as fractions of the viewport (x, y) with y up. */
const POSES_WIDE: Pose[] = [
  { x: 0.33, y: -0.02, scale: 0.7, amp: 0.28, opacity: 1 },
  { x: -0.34, y: -0.2, scale: 0.5, amp: 0.34, opacity: 0.9 },
  { x: 0.34, y: 0.12, scale: 0.6, amp: 0.46, opacity: 0.9 },
  { x: -0.34, y: -0.08, scale: 0.55, amp: 0.22, opacity: 0.9 },
  { x: 0.3, y: 0.04, scale: 0.8, amp: 0.34, opacity: 0.7 },
];
const POSES_NARROW: Pose[] = [
  { x: 0.0, y: 0.3, scale: 0.55, amp: 0.28, opacity: 1 },
  { x: 0.28, y: 0.3, scale: 0.34, amp: 0.34, opacity: 0.3 },
  { x: -0.28, y: 0.3, scale: 0.36, amp: 0.46, opacity: 0.3 },
  { x: 0.28, y: 0.3, scale: 0.34, amp: 0.22, opacity: 0.3 },
  { x: 0.0, y: 0.18, scale: 0.6, amp: 0.34, opacity: 0.3 },
];

const SHARD_COUNT = 42;

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Which section the viewport centre is in, plus how far toward the next one. */
function sectionProgress() {
  const probe = window.scrollY + window.innerHeight * 0.5;
  const tops = SECTION_IDS.map((id) => {
    const el = document.getElementById(id);
    return el ? el.getBoundingClientRect().top + window.scrollY : 0;
  });
  let i = 0;
  for (let k = 0; k < tops.length; k++) if (probe >= tops[k]) i = k;
  const next = tops[i + 1];
  if (next === undefined) return { i, t: 0 };
  // Hold the pose for the first part of a section, then glide to the next one.
  return { i, t: smoothstep(0.4, 0.95, (probe - tops[i]) / (next - tops[i])) };
}

function applyShardColors(shards: THREE.InstancedMesh) {
  const c = readColors();
  const color = new THREE.Color();
  for (let i = 0; i < SHARD_COUNT; i++) {
    color.copy(c.a).lerp(c.b, hash(i + 77));
    shards.setColorAt(i, color);
  }
  if (shards.instanceColor) shards.instanceColor.needsUpdate = true;
}

const dummy = new THREE.Object3D();

/** Per-frame update, kept outside the component so it can mutate three.js objects. */
function step(
  material: THREE.ShaderMaterial,
  ringMaterial: THREE.PointsMaterial,
  group: THREE.Group,
  ring: THREE.Points,
  shards: THREE.InstancedMesh,
  state: RootState,
  pointer: THREE.Vector2,
  smooth: THREE.Vector2,
  pose: Pose,
  delta: number,
  reduced: boolean,
) {
  const u = material.uniforms;
  if (!reduced) u.uTime.value += delta;
  const time = u.uTime.value as number;

  const ease = Math.min(1, delta * 3);
  smooth.x += (pointer.x - smooth.x) * ease;
  smooth.y += (pointer.y - smooth.y) * ease;
  u.uPointer.value.set(smooth.x, -smooth.y);

  // The orb travels between a pose per section.
  const poses = state.viewport.aspect > 1.1 ? POSES_WIDE : POSES_NARROW;
  const { i, t } = sectionProgress();
  const from = poses[i];
  const to = poses[Math.min(i + 1, poses.length - 1)];
  const follow = reduced ? 1 : Math.min(1, delta * 4);
  pose.x += (lerp(from.x, to.x, t) - pose.x) * follow;
  pose.y += (lerp(from.y, to.y, t) - pose.y) * follow;
  pose.scale += (lerp(from.scale, to.scale, t) - pose.scale) * follow;
  pose.amp += (lerp(from.amp, to.amp, t) - pose.amp) * follow;
  pose.opacity += (lerp(from.opacity, to.opacity, t) - pose.opacity) * follow;

  group.position.set(pose.x * state.viewport.width, pose.y * state.viewport.height, 0);
  group.scale.setScalar(pose.scale);
  group.rotation.x = smooth.y * 0.18;
  group.rotation.y = smooth.x * 0.3 + window.scrollY * 0.0009;
  u.uAmp.value = pose.amp;
  u.uOpacity.value = pose.opacity;
  ringMaterial.opacity = 0.85 * pose.opacity;
  if (!reduced) ring.rotation.z += delta * 0.07;

  // Shards live in page space: they scroll with the content, nearer ones a little faster.
  const worldPerPx = state.viewport.height / window.innerHeight;
  const pageWorld = document.documentElement.scrollHeight * worldPerPx;
  const scrollWorld = window.scrollY * worldPerPx;
  const halfW = state.viewport.width / 2;
  const wide = state.viewport.aspect > 1.1;
  for (let k = 0; k < SHARD_COUNT; k++) {
    const depth = hash(k + 11) * 5 - 3.5;
    const frac = (k + hash(k + 3) * 0.8) / SHARD_COUNT;
    const side = hash(k + 5) > 0.5 ? 1 : -1;
    const reach = wide ? 0.9 + hash(k + 7) * 0.2 : 0.55 + hash(k + 7) * 0.6;
    const x = side * halfW * reach + Math.sin(time * 0.3 + k) * 0.12;
    const y =
      state.viewport.height / 2 -
      frac * pageWorld +
      scrollWorld * (1 + depth * 0.06) +
      Math.sin(time * 0.4 + k * 1.7) * 0.18;
    dummy.position.set(x, y, depth);
    dummy.rotation.set(time * 0.15 * (1 + hash(k)), time * 0.2 * (1 + hash(k + 1)), k);
    dummy.scale.setScalar(wide ? 0.08 + hash(k + 13) * 0.18 : 0.1 + hash(k + 13) * 0.3);
    dummy.updateMatrix();
    shards.setMatrixAt(k, dummy.matrix);
  }
  shards.instanceMatrix.needsUpdate = true;
}

function Scene({ reduced }: { reduced: boolean }) {
  const { resolvedTheme } = useTheme();
  const invalidate = useThree((s) => s.invalidate);
  const pointer = useRef(new THREE.Vector2(0, 0));
  const smooth = useRef(new THREE.Vector2(0, 0));
  const pose = useRef<Pose>({ ...POSES_WIDE[0] });
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Points>(null);
  const shards = useRef<THREE.InstancedMesh | null>(null);

  const { orbGeometry, orbMaterial, ringGeometry, ringMaterial, shardGeometry, shardMaterial } =
    useMemo(() => {
      const orbGeometry = new THREE.IcosahedronGeometry(RADIUS, 48);
      const orbMaterial = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uPointer: { value: new THREE.Vector2() },
          uAmp: { value: 0.28 },
          uA: { value: new THREE.Color("#1d5fd8") },
          uB: { value: new THREE.Color("#3fb7ff") },
          uRim: { value: new THREE.Color("#cdeeff") },
          uDark: { value: 0 },
          uOpacity: { value: 1 },
        },
      });

      // A tilted disc of dots circling the orb.
      const positions = new Float32Array(RING_POINTS * 3);
      for (let i = 0; i < RING_POINTS; i++) {
        const angle = hash(i) * Math.PI * 2;
        const radius = RADIUS * (1.55 + hash(i + 9999) * 0.75);
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.sin(angle) * radius;
        positions[i * 3 + 2] = (hash(i + 4242) - 0.5) * 0.35;
      }
      const ringGeometry = new THREE.BufferGeometry();
      ringGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const ringMaterial = new THREE.PointsMaterial({
        size: 0.028,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      });

      const shardGeometry = new THREE.OctahedronGeometry(1, 0);
      const shardMaterial = new THREE.MeshStandardMaterial({
        flatShading: true,
        roughness: 0.3,
        metalness: 0.2,
        transparent: true,
        opacity: 0.88,
      });
      return { orbGeometry, orbMaterial, ringGeometry, ringMaterial, shardGeometry, shardMaterial };
    }, []);

  useEffect(() => {
    applyTheme(orbMaterial, ringMaterial, resolvedTheme === "dark");
    if (shards.current) applyShardColors(shards.current);
    invalidate();
  }, [resolvedTheme, orbMaterial, ringMaterial, invalidate]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        (e.clientY / window.innerHeight) * 2 - 1,
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    // With reduced motion the loop only runs on demand, so redraw when the page scrolls.
    const onScroll = () => invalidate();
    if (reduced) window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced, invalidate]);

  useEffect(() => {
    return () => {
      orbGeometry.dispose();
      orbMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      shardGeometry.dispose();
      shardMaterial.dispose();
    };
  }, [orbGeometry, orbMaterial, ringGeometry, ringMaterial, shardGeometry, shardMaterial]);

  useFrame((state, delta) => {
    if (!group.current || !ring.current || !shards.current) return;
    step(
      orbMaterial,
      ringMaterial,
      group.current,
      ring.current,
      shards.current,
      state,
      pointer.current,
      smooth.current,
      pose.current,
      delta,
      reduced,
    );
  });

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 5, 4]} intensity={2.4} />
      <instancedMesh
        ref={(mesh) => {
          shards.current = mesh;
          if (mesh) applyShardColors(mesh);
        }}
        args={[shardGeometry, shardMaterial, SHARD_COUNT]}
        frustumCulled={false}
      />
      <group ref={group}>
        <mesh geometry={orbGeometry} material={orbMaterial} />
        <points ref={ring} geometry={ringGeometry} material={ringMaterial} rotation={[1.15, 0.25, 0]} />
      </group>
    </>
  );
}

export default function JourneyScene() {
  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <Canvas
        dpr={[1, 1.75]}
        frameloop={reduced ? "demand" : "always"}
        camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 40 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <Scene reduced={reduced} />
      </Canvas>
    </div>
  );
}
