import { Download, DownloadCloud } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Button } from "./button";
import { FileMetadata } from "@/types/file";

interface FileTableProps {
  files: FileMetadata[];
  onDownload: (fileId: string) => void;
  onDownloadAll: () => void;
}

export function FileTable({
  files,
  onDownload,
  onDownloadAll,
}: FileTableProps) {
  function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  }

  return (
    <Table className="text-white">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Time</TableHead>
          <TableHead className="text-right">
            <Button variant="outline" size="sm" onClick={onDownloadAll}>
              <DownloadCloud className="h-4 w-4" />
              All
            </Button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => (
          <TableRow key={file.id}>
            <TableCell className="font-medium">
              {file.name.length > 20
                ? file.name.substring(0, 20) + "..."
                : file.name}
            </TableCell>
            <TableCell>{formatBytes(file.size)}</TableCell>
            <TableCell>{new Date(file.timestamp).toLocaleString()}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDownload(file.id)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
