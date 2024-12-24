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
  // const [peerConnection, setPeerConnection] =
  //   useState<RTCPeerConnection | null>(null);

    useEffect(() => {
      if (targetPeerId === null) {
        return;
      }
    
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
    
      const dataChannel = pc.createDataChannel("testChannel");
      console.log("Data channel created:", dataChannel);
    
      // Sự kiện kết nối và ICE
      pc.onconnectionstatechange = () => {
        console.log("Connection state:", pc.connectionState);
      };
    
      pc.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", pc.iceConnectionState);
      };
    
      pc.onicegatheringstatechange = () => {
        console.log("ICE gathering state:", pc.iceGatheringState);
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
          console.log("Created offer:", offer);
    
          await pc.setLocalDescription(offer);
          console.log("Local Description set:", pc.localDescription);
    
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
          console.log("Offer sent to target:", message);
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
