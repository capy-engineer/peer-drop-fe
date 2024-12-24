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
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (targetPeerId === null) {
      return;
    }
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Create data channel
    const dataChannel = pc.createDataChannel("fileTransfer");

    // Connection state handling
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      setConnected(pc.connectionState === "connected");
    };

    pc.onicecandidate = (event) => {
      console.log("ICE candidate event:", event);
      if (event.candidate) {
        console.log("Found ICE candidate:", event.candidate);
        try {
          const message = JSON.stringify({
            type: "ice-candidate",
            candidate: event.candidate,
            targetId: targetPeerId,
          });

          console.log("Sending message:", message);

          if (!wsRef.current) {
            console.error("WebSocket not connected");
            return;
          }

          wsRef.current.send(message);
          console.log("ICE candidate sent successfully");
        } catch (error) {
          console.error("Error sending ICE candidate:", error);
        }
      } else {
        console.log("ICE candidate gathering completed");
      }
    };

    // Data channel event handlers
    dataChannel.onopen = () => {
      console.log("Data channel opened");
      setConnected(true);
    };

    dataChannel.onclose = () => {
      console.log("Data channel closed");
      setConnected(false);
    };

    // Store in state
    setPeerConnection(pc);

    return () => {
      dataChannel.close();
      pc.close();
      setPeerConnection(null);
      setConnected(false);
    };
  }, [targetPeerId]);

  return (
    <div className="relative min-h-screen bg-black grid place-items-center overflow-hidden">
      <BackGround />

      <div className="relative z-10 flex flex-col gap-4 text-center">
        <div className="text-white font-bold italic xl:text-6xl text-6xl p-4  rounded-lg">
          Drag. Drop. Share — collaboration made simple.
        </div>
      </div>
      <FileDialog
        //files={files.map((fileUpload) => fileUpload.file)}
        open={open}
        setOpen={setOpen}
        connected={connected}
        setConnected={setConnected}
        uuid={uuid}
        setUuid={setUuid}
        wsRef={wsRef}
        setTargetPeerId={setTargetPeerId}
      />

      <style jsx global>{`
        @keyframes spinBlob {
          0% {
            transform: rotate(0deg) scale(2);
          }
          100% {
            transform: rotate(360deg) scale(2);
          }
        }
        .animate-spinBlob {
          animation: spinBlob 15s linear infinite;
        }
      `}</style>
    </div>
  );
}
