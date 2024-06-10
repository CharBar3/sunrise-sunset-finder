"use client";

import dynamic from "next/dynamic";
const MapTime = dynamic(() => import("@/components/MapTime"), { ssr: false });

export default function Home() {
  return <MapTime />;
}
