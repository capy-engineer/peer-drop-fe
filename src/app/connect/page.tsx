"use client";
import BackGround from "@/components/ui/BackGround";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!searchParams) {
      console.error("No search params found");
      return;
    }

    const peerId = searchParams.get("peerId");

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    const apiHost = process.env.NEXT_PUBLIC_CN_URL
      ? `${process.env.NEXT_PUBLIC_CN_URL}?peerId=${peerId || ""}`
      : undefined;

    if (!apiHost) {
      console.error("NEXT_PUBLIC_CN_URL is not defined");
      return;
    }

    wsRef.current = new WebSocket(apiHost);
    wsRef.current.onopen = () => {
      console.log("Socket connection established");
    };
    wsRef.current.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.senderId) {
          if (data.type === "offer" && data.offer) {
            await pcRef.current?.setRemoteDescription(
              new RTCSessionDescription(data.offer)
            );
          }
          if (data.type === "ice-candidate" && data.candidate) {
            await pcRef.current?.addIceCandidate(
              new RTCIceCandidate(data.candidate)
            );
          }
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", event.data, error);
      }
    };
    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    wsRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        try {
          const message = JSON.stringify({
            type: "ice-candidate",
            candidate: event.candidate,
            targetId: peerId,
          });

          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(message);
            alert("ICE candidate sent successfully");
          } else {
            alert("WebSocket not connected or not open");
          }
        } catch (error) {
          alert(`error sending ICE candidate: ${error}`);
        }
      } else {
        console.log("ICE candidate gathering completed");
      }
    };

    const startConnection = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const message = JSON.stringify({
          type: "offer",
          offer,
          targetId: peerId,
        });
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(message);
        } else {
          console.error("WebSocket not connected or not open", wsRef.current);
        }
      } catch (error) {
        console.error("Error creating or sending offer:", error);
      }
    };
    startConnection();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }

      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, [searchParams]);

  return (
    <div className="relative min-h-screen bg-black grid place-items-center overflow-hidden">
      <BackGround />
      <div className="relative z-10 flex flex-col gap-4 text-center">
        <div className="text-white font-bold italic xl:text-5xl text-5xl p-4  rounded-lg">
          Upload, share, and download &mdash; it&apos;s that simple.
        </div>
      </div>

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
