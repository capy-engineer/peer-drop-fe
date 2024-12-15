"use client";

import { useDropzone } from "react-dropzone";

interface FileUploaderProps {
  onDrop: (files: File[]) => void;
}

export default function FileUploader({ onDrop }: FileUploaderProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/*": [],
      "text/*": [],
      "image/*": [],
      "video/*": [],
      "audio/*": [],
    },
    maxSize: 5 * 1024 * 1024 * 1024, // 5GB limit
  });

  return (
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
  );
}
