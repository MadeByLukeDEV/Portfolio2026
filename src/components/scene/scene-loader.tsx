"use client";

import dynamic from "next/dynamic";

const OrbScene = dynamic(() => import("./orb-scene"), { ssr: false });

export function SceneLoader() {
  return <OrbScene />;
}
