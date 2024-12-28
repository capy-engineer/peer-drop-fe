"use client";

import BackGround from "@/components/ui/BackGround";
import { useWebSocketStore } from "@/store/ws";

export default function Page() {
  const { targetPeerId, uuid, connected, wsRef, pcRef } = useWebSocketStore();

  console.log(targetPeerId);
  console.log(uuid);
  console.log(connected);
  console.log(JSON.stringify(wsRef.current));
  console.log(JSON.stringify(pcRef.current));
  return (
    <div className="relative min-h-screen bg-black grid place-items-center overflow-hidden">
      <BackGround />
    </div>
  );
}
