"use client";
import BackGround from "@/components/ui/BackGround";
import { useEffect, useRef } from "react";
import { useSearchParams } from 'next/navigation'

export default function Page() {
  const searchParams = useSearchParams()
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = (peerId: string | undefined) => {
    const apiHost = process.env.NEXT_PUBLIC_CN_URL
      ? `${process.env.NEXT_PUBLIC_CN_URL}?peerId=${peerId || ""}`
      : undefined;

    if (!apiHost) {
      console.error("NEXT_PUBLIC_CN_URL is not defined");
      return;
    }

    console.log(apiHost);

    wsRef.current = new WebSocket(apiHost);
    wsRef.current.onopen = () => {
      console.log("Socket connection established");
    };
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.peerId) {
        } else {
          console.warn("Unexpected WebSocket message format:", data);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", event.data, error);
      }
    };
    wsRef.current.onerror = (error) => {
      alert( JSON.stringify(error));
    };
  };

  useEffect(() => {
    const peerId = searchParams.get('peerId');
    connectWebSocket(peerId || undefined);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
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
