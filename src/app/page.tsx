"use client";
import { useState } from "react";
import FileDialog from "@/components/ui/FileDialog";

export default function Home() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative min-h-screen bg-black grid place-items-center overflow-hidden">
      {/* Background Blob */}
      <div className="fixed inset-0 blur-[170px] z-0">
        <div className="absolute inset-0 w-[100vw] h-[100vh] min-w-[1000px] scale-90 rounded-full bg-white overflow-hidden">
          <div
            className="absolute inset-0 w-[100vw] h-[100vh] animate-spinBlob"
            style={{
              background:
                "conic-gradient(from 0deg, #08f, #f60, #bbffa1, #4c00ff, #ab2666, #09f)",
            }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-4 text-center">
        <div className="text-white font-bold italic xl:text-6xl text-6xl p-4  rounded-lg">
        Drag. Drop. Share — collaboration made simple.
        </div>
      </div>
      <FileDialog
        //files={files.map((fileUpload) => fileUpload.file)}
        open={open}
        setOpen={setOpen}
      />

      {/* Tailwind Custom Animation */}
      <style jsx global>{`
        @keyframes spinBlob {
          0% {
            transform: rotate(0deg) scale(2);
          }
          100% {
            transform: rotate(360deg) scale(2);
          }
        }
        .animate-spinBlob {
          animation: spinBlob 15s linear infinite;
        }
      `}</style>
    </div>
  );
}
