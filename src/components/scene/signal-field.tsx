"use client";

import { Canvas, useFrame, useThree, type RootState } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const COLS = 110;
const ROWS = 70;
const SIZE_X = 44;
const SIZE_Z = 30;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPx;
  uniform vec2 uPointer;
  attribute float aRand;
  varying float vH;
  varying float vFade;

  void main() {
    vec3 p = position;
    float wave = sin(p.x * 0.32 + uTime * 0.55) * 0.5 + sin(p.z * 0.42 - uTime * 0.4) * 0.5;
    float d = distance(p.xz, uPointer);
    float ripple = exp(-d * 0.3) * sin(d * 1.8 - uTime * 3.0) * 0.7;
    p.y = wave * 0.9 + ripple;
    vH = p.y;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.6 + aRand * 1.8) * uPx * (16.0 / -mv.z);
    vFade = smoothstep(34.0, 8.0, -mv.z);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uA;
  uniform vec3 uB;
  uniform float uOpacity;
  varying float vH;
  varying float vFade;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float a = smoothstep(0.5, 0.12, r);
    vec3 col = mix(uA, uB, smoothstep(-0.2, 1.3, vH));
    gl_FragColor = vec4(col, a * vFade * uOpacity);
    #include <colorspace_fragment>
  }
`;

/** Deterministic 0..1 noise so the field looks the same on every render. */
function hash(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function readSceneColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    a: new THREE.Color(style.getPropertyValue("--scene-a").trim() || "#3b4bff"),
    b: new THREE.Color(style.getPropertyValue("--scene-b").trim() || "#ffb547"),
  };
}

/** Per-frame update, kept outside the component so it can freely mutate three.js objects. */
function step(
  material: THREE.ShaderMaterial,
  group: THREE.Group | null,
  state: RootState,
  pointer: THREE.Vector2,
  delta: number,
  reduced: boolean,
) {
  const u = material.uniforms;
  u.uPx.value = state.gl.getPixelRatio();
  if (!reduced) u.uTime.value += delta;

  const max = document.documentElement.scrollHeight - window.innerHeight;
  const scroll = max > 0 ? Math.min(1, window.scrollY / max) : 0;

  // The pointer lerps toward the cursor, mapped roughly onto the field plane.
  const ease = Math.min(1, delta * 4);
  u.uPointer.value.x += (pointer.x * SIZE_X * 0.35 - u.uPointer.value.x) * ease;
  u.uPointer.value.y += (pointer.y * SIZE_Z * 0.3 - u.uPointer.value.y) * ease;

  // The first screen is the showpiece; the field recedes behind the content.
  u.uOpacity.value = 1 - Math.min(1, scroll * 6) * 0.62;

  if (group) {
    group.rotation.y = scroll * 1.4 + pointer.x * 0.06;
    group.position.y = -scroll * 2.5;
  }
  state.camera.position.set(0, 6.5 - scroll * 3, 13 - scroll * 3);
  state.camera.lookAt(0, -scroll * 2, 0);
}

function Field({ reduced }: { reduced: boolean }) {
  const { resolvedTheme } = useTheme();
  const invalidate = useThree((s) => s.invalidate);
  const pointer = useRef(new THREE.Vector2(0, 0));
  const group = useRef<THREE.Group>(null);

  const { geometry, material } = useMemo(() => {
    const count = COLS * ROWS;
    const positions = new Float32Array(count * 3);
    const rand = new Float32Array(count);
    let i = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        positions[i * 3] = (c / (COLS - 1) - 0.5) * SIZE_X;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = (r / (ROWS - 1) - 0.5) * SIZE_Z;
        rand[i] = hash(i);
        i++;
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uPx: { value: 1 },
        uPointer: { value: new THREE.Vector2(100, 100) },
        uA: { value: new THREE.Color("#3b4bff") },
        uB: { value: new THREE.Color("#ffb547") },
        uOpacity: { value: 1 },
      },
    });
    return { geometry, material };
  }, []);

  useEffect(() => {
    const { a, b } = readSceneColors();
    material.uniforms.uA.value.copy(a);
    material.uniforms.uB.value.copy(b);
    invalidate();
  }, [resolvedTheme, material, invalidate]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        (e.clientY / window.innerHeight) * 2 - 1,
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  useEffect(() => {
    materialRef.current = material;
  }, [material]);

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    step(materialRef.current, group.current, state, pointer.current, delta, reduced);
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}

export default function SignalField() {
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
        camera={{ position: [0, 6.5, 13], fov: 50, near: 0.1, far: 80 }}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      >
        <Field reduced={reduced} />
      </Canvas>
    </div>
  );
}
