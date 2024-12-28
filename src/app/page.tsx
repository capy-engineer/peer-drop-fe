"use client";
import { useEffect, useRef, useState } from "react";
import FileDialog from "@/components/ui/FileDialog";
import BackGround from "@/components/ui/BackGround";
import { useWebSocketStore } from "@/store/ws";

export default function Home() {
  const [open, setOpen] = useState(false);
  const pcRefA = useRef<RTCPeerConnection | null>(null);
  const {
    targetPeerId,
    setTargetPeerId,
    uuid,
    setUuid,
    connected,
    setConnected,
    wsRef,
    setWsRef,
  } = useWebSocketStore();

  const initializeWebSocket = (url: string): WebSocket => {
    const ws = new WebSocket(url);
    ws.onopen = () => console.log("WebSocket connected");
    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
    return ws;
  };

  useEffect(() => {
    if (!targetPeerId) return;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
    });
    pcRefA.current = pc;

    // Monitor ICE connection state
    pcRefA.current.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pcRefA.current?.iceConnectionState);
      if (pcRefA.current?.iceConnectionState === "connected") {
        console.log("P2P connection established!");
      }
    };

    // Monitor general connection state
    pcRefA.current.onconnectionstatechange = () => {
      console.log("Connection state:", pcRefA.current?.connectionState);
      if (pcRefA.current?.connectionState === "connected") {
        console.log("P2P connection fully established!");
      }
    };
    pcRefA.current?.createDataChannel("test");

    if (!wsRef.current) {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL; // Replace with your WebSocket URL
      if (!wsUrl) {
        console.error("WebSocket URL is not defined");
        return;
      }

      const ws = initializeWebSocket(wsUrl);
      setWsRef(ws);
    }

    if (!wsRef.current) return;
    wsRef.current.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "answer" && data.answer) {
          await pcRefA.current?.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
        }
        if (data.type === "ice-candidate" && data.candidate) {
          await pcRefA.current?.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
          console.log("Added ICE candidate.");
        }
      } catch (err) {
        console.error("WebSocket message parsing error:", err);
      }
    };

    pcRefA.current.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "ice-candidate",
            candidate: event.candidate,
            targetId: targetPeerId,
          })
        );
      } else {
        console.log("End of candidates.");
      }
    };

    const startConnection = async () => {
      try {
        const offer = await pcRefA.current?.createOffer();
        await pcRefA.current?.setLocalDescription(offer);
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

    const ws = wsRef.current;
    return () => {
      pcRefA.current?.close();
      ws?.close();
    };
  }, [targetPeerId, setWsRef, wsRef]);

  return (
    <div className="relative min-h-screen bg-black grid place-items-center overflow-hidden">
      <BackGround />
      <div className="relative z-10 flex flex-col gap-4 text-center">
        <div className="text-white font-bold italic xl:text-6xl text-6xl p-4">
          Drag. Drop. Share — collaboration made simple.
        </div>
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
