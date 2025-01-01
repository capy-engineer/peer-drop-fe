"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import BackGround from "@/components/ui/BackGround";
import { useSearchParams } from "next/navigation";
import { FileMessage, FileMetadata } from "@/types/file";
import { FileTable } from "@/components/ui/FileTable";

function ConnectPage() {
  const searchParams = useSearchParams();
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const fileChunks = useRef(new Map<string, Blob[]>());

  const initializeWebSocket = (url: string): WebSocket => {
    const ws = new WebSocket(url);
    ws.onopen = () => console.info("WebSocket connected");
    ws.onerror = (err) => {
      console.error(err);
    };
    return ws;
  };

  useEffect(() => {
    const peerId = searchParams?.get("peerId");
    if (!peerId) {
      console.error("peerId is missing in searchParams");
      return;
    }

    if (!pcRef.current) {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;
      pcRef.current.ondatachannel = (event) => {
        const dataChannel = event.channel;

        // Listen for messages on the data channel
        dataChannel.onmessage = (messageEvent) => {
          try {
            alert("Message received: " + messageEvent.data);
            const message: FileMessage = JSON.parse(messageEvent.data);
            if (message.type === "metadata") {
              fileChunks.current.set(message.id, []);
              
              setFiles((prev) => [
                ...prev,
                {
                  id : message.id,
                  name: message.name!,
                  size: message.size!,
                  type: message.type!,
                  timestamp: Date.now(),
                },
              ]);
            }

            if (message.type === "chunk") {
              const chunks = fileChunks.current.get(message.id) || [];
              const blob = new Blob([message.chunk!]);
              chunks.push(blob);
              fileChunks.current.set(message.id, chunks);

              if (message.chunkIndex === message.totalChunks! - 1) {
                const file = new Blob(chunks);
                // Handle complete file
                console.log("File received:", file);
              }
              
            }
          } catch (error) {
            console.error("Error processing message:", error);
          }
        };

        // Handle other events like open, close, or error
        dataChannel.onopen = () => {
          alert("Data channel is open");
        };


        dataChannel.onerror = (error) => {
          console.error("Data channel error:", error);
        };
      };
    }

    if (!wsRef.current) {
      const wsUrl = process.env.NEXT_PUBLIC_CN_URL;
      if (!wsUrl) {
        console.error("WebSocket URL is not defined");
        return;
      }
      wsRef.current = initializeWebSocket(`${wsUrl}?peerId=${peerId}`);
    }

    wsRef.current.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "offer" && data.offer) {
          await pcRef.current?.setRemoteDescription(
            new RTCSessionDescription(data.offer)
          );
          const answer = await pcRef.current?.createAnswer();
          await pcRef.current?.setLocalDescription(answer);
          wsRef.current?.send(
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
      wsRef.current?.close();
      pcRef.current?.close();
    };
  }, [searchParams]);
  return (
    <div className="relative min-h-screen bg-black grid place-items-center overflow-hidden">
      <BackGround />
      <FileTable files={files} />
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

export default function PageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConnectPage />
    </Suspense>
  );
}
