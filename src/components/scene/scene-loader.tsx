"use client";

import dynamic from "next/dynamic";

const JourneyScene = dynamic(() => import("./journey-scene"), { ssr: false });

export function SceneLoader() {
  return <JourneyScene />;
}
