"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

export default function Home() {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      console.log("File:", file);
    });
  }, []);

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

  return (
    <div className="flex justify-center items-center h-screen bg-sky-300">
      <div className="bg-white rounded-xl p-5 w-[70rem] h-[40rem]">
        <div>
          <h1 className="text-blue-500 text-4xl font-bold">Upload Files</h1>
          <p className="text-neutral-500 mt-4">
            Upload Documents you want to share with other people
          </p>
        </div>
        <div className="flex justify-between mt-5">
          <div
            {...getRootProps()}
            className={`flex items-center justify-center w-1/2 h-[30rem] border-2 ${
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
            <ul>
              <li>
                <div className="flex items-center border-2 rounded-sm p-3">
                  <Image
                    width={48}
                    height={48}
                    src="https://img.icons8.com/color/48/pdf.png"
                    alt="pdf"
                  />
                  <div className="w-full">
                    <div className="flex justify-between">
                      <p>Resume-pdf (100%)</p>
                      <p>Completed</p>
                    </div>
                    <div className="w-full bg-blue-500 rounded-full h-1 dark:bg-gray-700 mt-1"></div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
