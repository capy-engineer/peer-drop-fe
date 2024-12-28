"use client";
import { useEffect, useState } from "react";
import FileDialog from "@/components/ui/FileDialog";
import BackGround from "@/components/ui/BackGround";
import { useWebSocketStore } from "@/store/ws";

export default function Home() {
  const [open, setOpen] = useState(false);
  const {
    targetPeerId,
    setTargetPeerId,
    uuid,
    setUuid,
    connected,
    setConnected,
    wsRef,
    pcRef,
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
    pcRef.current = pc;

    
    pcRef.current?.createDataChannel("transfer");

    if (!wsRef.current) {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL; // Replace with your WebSocket URL
      if (!wsUrl) {
        console.error("WebSocket URL is not defined");
        return;
      }

      const ws = initializeWebSocket(wsUrl);
      wsRef.current = ws;
    }

    if (!wsRef.current) return;
    wsRef.current.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "answer" && data.answer) {
          await pcRef.current?.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
        }
        if (data.type === "ice-candidate" && data.candidate) {
          await pcRef.current?.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        }
      } catch (err) {
        console.error("WebSocket message parsing error:", err);
      }
    };

    if (pcRef.current) {
      pcRef.current.onicecandidate = (event) => {
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
    }

    const startConnection = async () => {
      try {
        const offer = await pcRef.current?.createOffer();
        await pcRef.current?.setLocalDescription(offer);
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
      // pcRef.current?.close();
      // ws?.close();
    };
  }, [targetPeerId, wsRef, pcRef]);
  console.log(targetPeerId);
  console.log(uuid);
  console.log(connected);
  console.log(JSON.stringify(wsRef));
  console.log(JSON.stringify(pcRef));
  console.log("==");
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
