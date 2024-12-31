"use client";

import BackGround from "@/components/ui/BackGround";
import FileDialog from "@/components/ui/FileDialog";
import FileList from "@/components/ui/FileList";
import FileUploader from "@/components/ui/FileUploader";
import { useWebSocketStore } from "@/store/ws";
import { useCallback, useState } from "react";

interface FileUpload {
  file: File;
  progress: number;
  status: "Uploading" | "Completed" | "Failed";
}

export default function Page() {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const { targetPeerId, uuid, connected, wsRef, pcRef } = useWebSocketStore();
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      progress: 0,
      status: "Uploading" as const,
    }));
    setFiles((prevFiles) => [...newFiles, ...prevFiles]);
    // Simulate upload progress
    newFiles.forEach((file, index) => simulateUpload(file, index));
  }, []);
  const simulateUpload = (file: FileUpload, index: number) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5; // Increment progress by 10% every interval
      setFiles((prevFiles) =>
        prevFiles.map((f, i) =>
          i === index ? { ...f, progress, status: "Uploading" } : f
        )
      );
      if (progress >= file.file.size / (1024 * 1024 * 5)) {
        clearInterval(interval);
        setFiles((prevFiles) =>
          prevFiles.map((f, i) =>
            i === index ? { ...f, progress: 100, status: "Completed" } : f
          )
        );
      }
    }, 500); // Simulate a delay of 500ms
  };

  return (
    <div className="relative min-h-screen bg-black grid place-items-center overflow-hidden">
      <BackGround />
      <div className="flex justify-center items-center h-screen bg-sky-300">
        <div className="bg-white rounded-xl p-5 w-[65rem] h-[40rem]">
          <div>
            <h1 className="text-blue-500 text-4xl font-bold">Upload Files</h1>
            <p className="text-neutral-500 mt-4">
              Upload Documents you want to share with other people
            </p>
          </div>
          <div className="flex justify-between mt-5">
            <FileUploader onDrop={onDrop} />
            <FileList files={files} />
          </div>
        </div>
      </div>
      <div className="blob-outer-container">
        <div className="blob-inner-container">
          <div className="blob"></div>
        </div>
      </div>
    </div>
  );
}
