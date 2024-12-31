import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";
interface FileDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  connected: boolean;
  setConnected: (connected: boolean) => void;
  uuid: string | null;
  setUuid: (uuid: string | null) => void;
  wsRef: React.RefObject<WebSocket | null>;
  setTargetPeerId: (targetPeerId: string | null) => void;
}

export default function FileDialog({
  open,
  setOpen,
  connected,
  setConnected,
  uuid,
  setUuid,
  wsRef,
  setTargetPeerId,
}: FileDialogProps) {
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = () => {
    if (wsRef.current) return;

    const apiHost = process.env.NEXT_PUBLIC_WS_URL;
    if (!apiHost) {
      console.error("NEXT_PUBLIC_WS_URL is not defined");
      return;
    }

    wsRef.current = new WebSocket(apiHost);

    wsRef.current.onopen = () => {
      console.log("Socket connection established");
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.peerId && data.type !== "connect") {
          setUuid(data.peerId);
        } else if (data.type === "connect") {
          setConnected(true);
          setTargetPeerId(data.peerId);
        } else {
          console.warn("Unexpected WebSocket message format:", data);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", event.data, error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // wsRef.current.onclose = () => {
    //   console.log("WebSocket connection closed");
    //   wsRef.current = null; // Allow reconnection if needed
    // };
  };
  useEffect(() => {
    if (connected) {
      setShowAlert(true);
      timeoutRef.current = setTimeout(() => {
        setShowAlert(false);
        redirect("/transfer");
      }, 3000);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [connected]);

  return (
    <>
      {showAlert && (
        <div
          className="fixed top-4 right-4 z-[9999] 
        animate-in fade-in slide-in-from-top-2
        transition-all duration-700 ease-in-out
        transform scale-100 opacity-100
        hover:scale-105
        min-w-[320px]"
        >
          <Alert className="bg-green-50 border-green-200 p-6 rounded-lg border-l-4">
            <AlertCircle className="h-6 w-6 text-green-600" />
            <AlertTitle className="text-green-800 text-lg font-semibold">
              Success
            </AlertTitle>
            <AlertDescription className="text-green-600 text-base mt-2">
              Connection established successfully.
            </AlertDescription>
          </Alert>
        </div>
      )}
      <div className="relative z-10 xl:top-[-360px] top-[-170px]">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="default"
              className="text-white font-semibold text-xl rounded-xl bg-sky-500 hover:bg-sky-400  px-[2rem] py-[1.5rem]"
              onClick={connectWebSocket}
            >
              Get Started
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white rounded-xl p-5 ">
            <DialogHeader>
              <DialogTitle>Share connection</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {uuid && (
                <div className="mt-4 flex flex-col items-center">
                  <p className="mb-5">Device ID : {uuid}</p>
                  <QRCodeSVG
                    value={`${process.env.NEXT_PUBLIC_HTTP_URL}/connect?peerId=${uuid}`}
                    size={256}
                  />
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${process.env.NEXT_PUBLIC_HTTP_URL}/connect?peerId=${uuid}`}
                      className="px-3 py-2 border rounded-md w-64"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${process.env.NEXT_PUBLIC_HTTP_URL}/connect?peerId=${uuid}`
                        );
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
