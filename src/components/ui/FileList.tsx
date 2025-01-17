import Image from "next/image";

interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: "Uploading" | "Completed" | "Failed";
}

export interface FileListProps {
  files: FileUpload[];
  deleteFile: (id: string) => void;
}

export default function FileList({ files,deleteFile }: FileListProps) {
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
    <div className="w-1/2 pl-10">
      <p className="text-3xl font-medium justify-start mb-4">Uploaded Files</p>
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
                  className="size-6 cursor-pointer mr-2"
                  onClick={() => deleteFile(file.id)}
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
  );
}
