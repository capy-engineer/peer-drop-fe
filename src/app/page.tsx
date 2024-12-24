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
  

  useEffect(() => {
    if (targetPeerId === null) {
      return;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    wsRef.current!.onopen = () => {
      console.log("Socket connection established");
    };
    wsRef.current!.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.senderId) {
          if (data.type === "offer") {
            console.log("Received offer:", data.offer);
            await pc.setRemoteDescription(
              new RTCSessionDescription(data.offer)
            );
          } else if (data.type === "ice-candidate" && data.candidate) {
            console.log("Received ICE candidate:", data.candidate);
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        } else {
          console.warn("Unexpected WebSocket message format:", data);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", event.data, error);
      }
    };
    wsRef.current!.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // const dataChannel = pc.createDataChannel("testChannel");

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        try {
          const message = JSON.stringify({
            type: "ice-candidate",
            candidate: event.candidate,
            targetId: targetPeerId,
          });

          if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.error("WebSocket not connected or not open");
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

    // Tạo offer và đặt Local Description
    const startConnection = async () => {
      try {
        const offer = await pc.createOffer();

        await pc.setLocalDescription(offer);

        // Gửi offer qua WebSocket
        const message = JSON.stringify({
          type: "offer",
          offer,
          targetId: targetPeerId,
        });
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          console.error("WebSocket not connected or not open");
          return;
        }

        wsRef.current.send(message);
        console.log("Offer sent successfully");
      } catch (error) {
        console.error("Error during connection setup:", error);
      }
    };

    startConnection();

    return () => {
      pc.close();
    };
  }, [targetPeerId, wsRef]);

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
