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

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [uuid]);

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
                    Copy
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
