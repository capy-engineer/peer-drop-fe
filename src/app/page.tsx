"use client";
import { useCallback } from "react";
import { useState } from "react";
import FileDialog from "@/components/ui/FileDialog";
import FileList from "@/components/ui/FileList";
import FileUploader from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/button";

interface FileUpload {
  file: File;
  progress: number;
  status: "Uploading" | "Completed" | "Failed";
}

// export default function Home() {
//   const [files, setFiles] = useState<FileUpload[]>([]);
//   const [open, setOpen] = useState(false);

//   const onDrop = useCallback((acceptedFiles: File[]) => {
//     const newFiles = acceptedFiles.map((file) => ({
//       file,
//       progress: 0,
//       status: "Uploading" as const,
//     }));
//     setFiles((prevFiles) => [...newFiles, ...prevFiles]);

//     // Simulate upload progress
//     newFiles.forEach((file, index) => simulateUpload(file, index));
//   }, []);

//   const simulateUpload = (file: FileUpload, index: number) => {
//     let progress = 0;
//     const interval = setInterval(() => {
//       progress += 5; // Increment progress by 10% every interval
//       setFiles((prevFiles) =>
//         prevFiles.map((f, i) =>
//           i === index ? { ...f, progress, status: "Uploading" } : f
//         )
//       );
//       if (progress >= file.file.size / (1024 * 1024 * 5)) {
//         clearInterval(interval);
//         setFiles((prevFiles) =>
//           prevFiles.map((f, i) =>
//             i === index ? { ...f, progress: 100, status: "Completed" } : f
//           )
//         );
//       }
//     }, 500); // Simulate a delay of 500ms
//   };

//   return (
//     // <div className="flex justify-center items-center h-screen bg-sky-300">
//     //   <div className="bg-white rounded-xl p-5 w-[65rem] h-[40rem]">
//     //     <div>
//     //       <h1 className="text-blue-500 text-4xl font-bold">Upload Files</h1>
//     //       <p className="text-neutral-500 mt-4">
//     //         Upload Documents you want to share with other people
//     //       </p>
//     //     </div>
//     //     <div className="flex justify-between mt-5">
//     //       <FileUploader onDrop={onDrop} />
//     //       <FileList files={files} />
//     //     </div>

//     //     <FileDialog
//     //       files={files.map((fileUpload) => fileUpload.file)}
//     //       open={open}
//     //       setOpen={setOpen}
//     //     />
//     //   </div>
//     // </div>
//     <div className="blob-outer-container">
//       <div className="blob-inner-container">
//         <div className="blob"></div>
//       </div>
//     </div>
//   );
// }

export default function Home() {
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
        <div className="text-white font-bold italic text-6xl p-4  rounded-lg">
          Upload, share, and download — it&apos;s that simple.
        </div>
      </div>
      <Button className="relative z-10 top-[-360px] text-white font-semibold text-xl rounded-xl bg-sky-500 hover:bg-sky-400  px-[2rem] py-[1.5rem]">
        Get Started
      </Button>

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
