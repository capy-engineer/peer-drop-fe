"use client";

import FileDialog from "@/components/ui/FileDialog";
import FileList from "@/components/ui/FileList";
import FileUploader from "@/components/ui/FileUploader";
import { useCallback, useState } from "react";

interface FileUpload {
  file: File;
  progress: number;
  status: "Uploading" | "Completed" | "Failed";
}

export default function Home() {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [open, setOpen] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      progress: 0,
      status: "Uploading" as const,
    }));
    setFiles((prevFiles) => [...newFiles, ...prevFiles]);

    newFiles.forEach((file, index) => simulateUpload(file, index));
  }, []);

  const simulateUpload = (file: FileUpload, index: number) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setFiles((prevFiles) =>
        prevFiles.map((f, i) =>
          i === index ? { ...f, progress, status: "Uploading" } : f
        )
      );
      if (progress >= 100) {
        clearInterval(interval);
        setFiles((prevFiles) =>
          prevFiles.map((f, i) =>
            i === index ? { ...f, progress: 100, status: "Completed" } : f
          )
        );
      }
    }, 500);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-sky-300">
      <div className="bg-white rounded-xl p-5 w-[65rem] h-[40rem]">
        <h1 className="text-blue-500 text-4xl font-bold">Upload Files</h1>
        <FileUploader onDrop={onDrop} />
        <FileList files={files} />
        <FileDialog files={files.map((f) => f.file)} open={open} setOpen={setOpen} />
      </div>
    </div>
  );
}
