"use client";

import BackGround from "@/components/ui/BackGround";
import { Button } from "@/components/ui/button";
import FileList from "@/components/ui/FileList";
import FileUploader from "@/components/ui/FileUploader";
import { useWebSocketStore } from "@/store/ws";
import { useCallback, useState } from "react";

interface FileUpload {
  file: File;
  progress: number;
  status: "Uploading" | "Completed" | "Failed";
}
const CHUNK_SIZE = 16384; // 16KB chunks

interface FileTransfer extends FileUpload {
  id: string;
  totalChunks: number;
  currentChunk: number;
}

export default function Page() {
  const [files, setFiles] = useState<FileTransfer[]>([]);
const { dataChannelRef } = useWebSocketStore();
console.log(dataChannelRef.current);
  const sendFile = async (file: File) => {
    if (!dataChannelRef.current) return;

    const fileId = crypto.randomUUID();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    // Send metadata first
    dataChannelRef.current.send(
      JSON.stringify({
        type: "metadata",
        id: fileId,
        name: file.name,
        size: file.size,
        totalChunks,
      })
    );
    const reader = new FileReader();
    let offset = 0;

    const sendChunk = async () => {
      if (offset >= file.size) return;

      const chunk = file.slice(offset, offset + CHUNK_SIZE);
      reader.readAsArrayBuffer(chunk);

      reader.onload = (e) => {
        dataChannelRef.current?.send(
          JSON.stringify({
            type: "chunk",
            id: fileId,
            chunk: e.target?.result,
            index: Math.floor(offset / CHUNK_SIZE),
          })
        );

        offset += CHUNK_SIZE;
        const progress = Math.min(100, (offset / file.size) * 100);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  progress,
                  currentChunk: Math.floor(offset / CHUNK_SIZE),
                }
              : f
          )
        );
        sendChunk();
      };
    };

    sendChunk();
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: "Uploading" as const,
      totalChunks: Math.ceil(file.size / CHUNK_SIZE),
      currentChunk: 0,
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
      <div className="flex justify-center items-center h-screen z-50">
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
          <Button className="">Send</Button>
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
