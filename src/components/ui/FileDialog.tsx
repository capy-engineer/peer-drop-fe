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
      const apiHost = process.env.API_HOST_1;
      if (apiHost) {
        socket = new WebSocket(apiHost);
        socket.onopen = () => {
          console.log("Socket connection established");
        };

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.uuid) {
            setUuid(data.uuid);
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
    }
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
              Are you sure you want to share these files?
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsSharing(true); // Start sharing files
              }}
            >
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
