import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

interface FileDialogProps {
  files: File[];
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function FileDialog({ files, open, setOpen }: FileDialogProps) {
  const [uuid, setUuid] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    let socket: WebSocket;

    if (isSharing) {
      const apiHost = process.env.NEXT_PUBLIC_WS_URL;
      console.log(apiHost);
      if (apiHost) {
        socket = new WebSocket(apiHost);
        socket.onopen = () => {
          console.log("Socket connection established");
        };

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.peerId) {
            setUuid(data.peerId);
          }
        };

        socket.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        socket.onclose = () => {
          console.log("WebSocket connection closed");
        };
      } else {
        console.error("API_HOST_1 is not defined");
      }
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [isSharing]);

  return (
    <div className="flex justify-center mt-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="bg-blue-500">
            Send Files
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Files</DialogTitle>
            <DialogDescription>
              {uuid
                ? "Your files are ready to be shared."
                : "Are you sure you want to share these files?"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>Total files: {files.length}</p>
            <p>
              Total size:{" "}
              {(
                files.reduce((acc, file) => acc + file.size, 0) /
                (1024 * 1024)
              ).toFixed(2)}{" "}
              MB
            </p>
            {uuid && (
              <div className="mt-4 text-center">
                <QRCodeSVG value={uuid} size={256} />
                <div className="mt-4 flex items-center justify-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://your-site.com/${uuid}`}
                    className="px-3 py-2 border rounded-md w-64"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `https://your-site.com/${uuid}`
                      );
                    }}
                    className="gap-2"
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
            {!uuid && (
              <Button
                onClick={() => {
                  setIsSharing(true); // Trigger WebSocket connection
                }}
              >
                Share
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
