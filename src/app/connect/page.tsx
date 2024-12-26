"use client";
import BackGround from "@/components/ui/BackGround";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const initializeWebSocket = (url: string): WebSocket => {
    const ws = new WebSocket(url);
    ws.onopen = () => console.info("WebSocket connected");
    ws.onerror = (err) => {
      console.log(err);
    };
    return ws;
  };

  useEffect(() => {
    // Get the peerId from the URL query params
    if (!searchParams) {
      console.error("No search params found");
      return;
    }
    const peerId = searchParams.get("peerId");
    // Create a new RTCPeerConnection instance
    if (!pcRef.current) {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;
    }
    
    // Create a new WebSocket connection
    if (!wsRef.current) {
      const wsUrl = process.env.NEXT_PUBLIC_CN_URL; // Replace with your WebSocket URL
      if (!wsUrl) {
        console.error("WebSocket URL is not defined");
        return;
      }
      const url = `${wsUrl}?peerId=${peerId}`;
      wsRef.current = initializeWebSocket(url);
    }

    // Handle incoming WebSocket messages
    wsRef.current.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "offer" && data.offer) {
          await pcRef.current?.setRemoteDescription(
            new RTCSessionDescription(data.offer)
          );
          const answer = await pcRef.current?.createAnswer();
          await pcRef.current?.setLocalDescription(answer);
          if (wsRef.current!.readyState !== WebSocket.OPEN) {
            return;
          }
          wsRef.current!.send(
            JSON.stringify({
              type: "answer",
              answer,
              targetId: peerId,
            })
          );
        }
        if (data.type === "ice-candidate" && data.candidate) {
          await pcRef.current?.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", event.data, error);
      }
    };

    // Handle ICE candidates
    pcRef.current.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "ice-candidate",
            candidate: event.candidate,
            targetId: peerId,
          })
        );
      }
    };

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
