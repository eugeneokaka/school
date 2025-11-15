"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export function FileUpload({
  onComplete,
}: {
  onComplete?: (urls: string[]) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileValidation = (files: File[]) => {
    const invalidFile = files.find((file) => file.size > 4 * 1024 * 1024);
    if (invalidFile) {
      toast.error(
        `"${invalidFile.name}" is larger than 4MB. Please upload a smaller file.`
      );
      return false;
    }
    return true;
  };

  return (
    <div className="flex items-center gap-3">
      <UploadButton<OurFileRouter, "studentAttachment">
        endpoint="studentAttachment"
        onBeforeUploadBegin={(files) => {
          if (!handleFileValidation(files)) return [];
          setIsUploading(true);
          toast.info("Uploading files...");
          return files;
        }}
        onClientUploadComplete={(res) => {
          setIsUploading(false);
          if (!res?.length) {
            toast.error("Upload failed. Please try again.");
            return;
          }
          const urls = res.map((r) => r.url);
          toast.success("Upload complete!");
          onComplete?.(urls);
        }}
        onUploadError={(err) => {
          setIsUploading(false);
          console.error("Upload error:", err);
          toast.error(err.message || "Upload failed.");
        }}
        appearance={{
          button:
            "inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium bg-white hover:bg-gray-50 transition",
          container: "mt-2",
        }}
        content={{
          button({ ready }) {
            return ready ? "Upload files" : "Preparing...";
          },
        }}
      />
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg
            className="animate-spin h-4 w-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 010 16v4l3.5-3.5L12 20v-4a8 8 0 01-8-8z"
            />
          </svg>
          Uploading...
        </div>
      )}
    </div>
  );
}
