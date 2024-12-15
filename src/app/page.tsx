"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useState } from "react";
import Image from "next/image";
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/*": [],
      "text/*": [],
      "image/*": [],
      "video/*": [],
      "audio/*": [],
    }, // Accept all file types
    maxSize: 5 * 1024 * 1024 * 1024, // 5GB limit
  });

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/"))
      return "https://img.icons8.com/color/48/image.png";
    if (type.startsWith("video/"))
      return "https://img.icons8.com/color/48/video.png";
    if (type.startsWith("audio/"))
      return "https://img.icons8.com/color/48/music.png";
    if (type.startsWith("application/pdf"))
      return "https://img.icons8.com/color/48/pdf.png";
    return "https://img.icons8.com/color/48/file.png";
  };

  return (
    <div className="flex justify-center items-center h-screen bg-sky-300">
      <div className="bg-white rounded-xl p-5 w-[65rem] h-[40rem]">
        <div>
          <h1 className="text-blue-500 text-4xl font-bold">Upload Files</h1>
          <p className="text-neutral-500 mt-4">
            Upload Documents you want to share with other people
          </p>
        </div>
        <div className="flex justify-between mt-5">
          <div
            {...getRootProps()}
            className={`flex items-center justify-center w-[25rem] h-[25rem] border-2 ${
              isDragActive ? "border-blue-500" : "border-gray-300"
            } border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Upload any file type (e.g., SVG, PNG, JPG, GIF, etc.)
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Maximum size: 5GB
              </p>
            </div>
          </div>

          <div className="w-1/2 pl-10">
            <p className="text-3xl font-medium justify-start mb-4">
              Uploaded Files
            </p>
            <div className="h-[22rem] overflow-y-auto">
              <ul>
                {files.map((file, index) => (
                  <li key={index} className="mb-4">
                    <div className="flex items-center border-2 rounded-sm p-1">
                      <Image
                        width={48}
                        height={48}
                        src={getFileIcon(file.file.type)}
                        alt={file.file.type}
                      />
                      <div className="w-full pl-4 pr-2">
                        <div className="flex justify-between">
                          <p>
                            {file.file.name.length > 20
                              ? file.file.name.substring(0, 15) + "..."
                              : file.file.name}{" "}
                            {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                          <p>{file.status}</p>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-1 mt-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full"
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-7"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
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
                    files.reduce((acc, file) => acc + file.file.size, 0) /
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
      </div>
    </div>
  );
}
