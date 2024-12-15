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

interface FileDialogProps {
  files: File[];
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function FileDialog({ files, open, setOpen }: FileDialogProps) {
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
                // Handle file sharing logic here
                console.log("Sharing files...");
                setOpen(false);
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
