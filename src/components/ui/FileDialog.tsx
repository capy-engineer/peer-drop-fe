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

  useEffect(() => {
    let socket: WebSocket | null = null;

    const apiHost = process.env.NEXT_PUBLIC_WS_URL;
    console.log(apiHost);
    if (apiHost) {
      socket = new WebSocket(apiHost);

      socket.onopen = () => {
        console.log("Socket connection established");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.peerId) {
            setUuid(data.peerId);
          } else {
            console.warn("Unexpected WebSocket message format:", data);
          }
        } catch (error) {
          console.error(
            "Failed to parse WebSocket message:",
            event.data,
            error
          );
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };
    } else {
      console.error("NEXT_PUBLIC_WS_URL is not defined");
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  return (
    <div className="flex justify-center mt-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {files.length > 0 ? (
            <Button variant="default" className="bg-blue-500">
              Send Files
            </Button>
          ) : (
            <Button variant="default" className="bg-blue-500 hidden">
              Send Files
            </Button>
          )}
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
            {uuid && (
              <div className="mt-4 flex flex-col items-center">
                <p>Total files: {files.length}</p>
                <p className="mb-4">
                  Total size:{" "}
                  {(
                    files.reduce((acc, file) => acc + file.size, 0) /
                    (1024 * 1024)
                  ).toFixed(2)}{" "}
                  MB
                </p>
                <QRCodeSVG
                  value={uuid}
                  size={256}
                  imageSettings={{
                    src: "https://picsbed.top/file/fhGovySlxNBNw%2FSC%2F%2FeAzE5Snn8RHj6GnKHzyWP36fQ%3D",
                    x: undefined,
                    y: undefined,
                    height: 80,
                    width: 80,
                    opacity: 1,
                    excavate: true,
                  }}
                />
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
  );
}
