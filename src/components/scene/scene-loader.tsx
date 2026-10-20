"use client";

import dynamic from "next/dynamic";

const SignalField = dynamic(() => import("./signal-field"), { ssr: false });

export function SceneLoader() {
  return <SignalField />;
}
