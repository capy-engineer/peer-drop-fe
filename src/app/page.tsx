"use client";
import { useEffect, useRef, useState } from "react";
import FileDialog from "@/components/ui/FileDialog";
import BackGround from "@/components/ui/BackGround";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [uuid, setUuid] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [targetPeerId, setTargetPeerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initializeWebSocket = (url: string): WebSocket => {
    const ws = new WebSocket(url);
    ws.onopen = () => console.log("WebSocket connected");
    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setError("WebSocket connection failed");
    };
    return ws;
  };

  useEffect(() => {
    if (!targetPeerId) return;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    if (!wsRef.current) {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL; // Replace with your WebSocket URL
      if (!wsUrl) {
        console.error("WebSocket URL is not defined");
        setError("WebSocket URL missing");
        return;
      }
      wsRef.current = initializeWebSocket(wsUrl);
    }

    wsRef.current.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.senderId === targetPeerId) {
          if (data.type === "offer") {
            console.log("Received offer:", data.offer);
            await pc.setRemoteDescription(
              new RTCSessionDescription(data.offer)
            );
          }
          if (data.type === "ice-candidate" && data.candidate) {
            console.log("Received ICE candidate:", data.candidate);
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        }
      } catch (err) {
        console.error("WebSocket message parsing error:", err);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "ice-candidate",
            candidate: event.candidate,
            targetId: targetPeerId,
          })
        );
      }
    };

    const startConnection = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        wsRef.current?.send(
          JSON.stringify({
            type: "offer",
            offer,
            targetId: targetPeerId,
          })
        );
      } catch (err) {
        console.error("Error creating offer:", err);
      }
    };

    startConnection();

    return () => {
      pc.close();
      wsRef.current?.close();
    };
  }, [targetPeerId]);

  return (
    <div className="relative min-h-screen bg-black grid place-items-center overflow-hidden">
      <BackGround />
      <div className="relative z-10 flex flex-col gap-4 text-center">
        <div className="text-white font-bold italic xl:text-6xl text-6xl p-4">
          Drag. Drop. Share — collaboration made simple.
        </div>
        {error && <div className="text-red-500">{error}</div>}
      </div>
      <FileDialog
        open={open}
        setOpen={setOpen}
        connected={connected}
        setConnected={setConnected}
        uuid={uuid}
        setUuid={setUuid}
        wsRef={wsRef}
        setTargetPeerId={setTargetPeerId}
      />
    </div>
  );
}
