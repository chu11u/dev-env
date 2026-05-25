"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange?: (url: string) => void;
  accept?: string;
  maxSize?: number;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export function ImageUpload({
  label,
  value,
  onChange,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setPreviewUrl(undefined);
    setStatus("idle");
    setErrorMessage("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const clearImage = useCallback(() => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    onChange?.("");
    resetState();
  }, [previewUrl, onChange, resetState]);

  const uploadFile = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return data.url;
    },
    []
  );

  const handleFile = useCallback(
    async (file: File) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select an image file (JPG, PNG, or WEBP)");
        setStatus("error");
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        setErrorMessage(`File is too large. Max size is ${maxSize / (1024 * 1024)}MB`);
        setStatus("error");
        return;
      }

      // Show local preview immediately
      const blobUrl = URL.createObjectURL(file);
      setPreviewUrl(blobUrl);
      setStatus("uploading");
      setErrorMessage("");

      try {
        const url = await uploadFile(file);
        setPreviewUrl(url);
        setStatus("success");
        onChange?.(url);

        // Revoke the blob URL since we now have the server URL
        URL.revokeObjectURL(blobUrl);
      } catch {
        setErrorMessage("Upload failed. Please try again.");
        setStatus("error");
      }
    },
    [maxSize, uploadFile, onChange]
  );

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRetry = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  // Render states
  const renderDropZone = () => (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed
        cursor-pointer transition-colors duration-200
        ${dragOver
          ? "border-rose-400 bg-rose-50"
          : "border-cream-300 hover:border-rose-400 hover:bg-rose-50"
        }
      `}
    >
      <Upload
        className={`w-8 h-8 ${dragOver ? "text-rose-400" : "text-charcoal-400"}`}
        strokeWidth={1.5}
      />
      <div className="text-center">
        <p className="font-body text-sm text-charcoal-600">
          Drag &amp; drop an image or click to browse
        </p>
        <p className="font-body text-xs text-charcoal-400 mt-1">
          Max 5MB &middot; JPG / PNG / WEBP
        </p>
      </div>
    </div>
  );

  const renderUploading = () => (
    <div className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50">
      <div className="w-8 h-8 border-2 border-rose-200 border-t-rose-400 rounded-full animate-spin" />
      <p className="font-body text-sm text-charcoal-500">Uploading...</p>
    </div>
  );

  const renderSuccess = () => (
    <div className="relative inline-block">
      <img
        src={previewUrl}
        alt={label}
        className="w-24 h-24 rounded-xl object-cover border border-cream-200"
      />
      <div className="absolute -top-2 -right-2">
        <CheckCircle className="w-5 h-5 text-green-500" strokeWidth={2} />
      </div>
      <button
        onClick={clearImage}
        className="absolute -top-1 -start-1 p-1 rounded-full bg-white shadow-soft border border-cream-200 hover:bg-red-50 hover:text-red-500 transition-colors"
        aria-label="Remove image"
      >
        <X className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
      <p className="font-body text-xs text-green-600 mt-2 text-center">
        Upload successful
      </p>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-dashed border-red-300 bg-red-50">
      <AlertCircle className="w-8 h-8 text-red-500" strokeWidth={1.5} />
      <p className="font-body text-sm text-red-600 text-center">{errorMessage}</p>
      <button
        onClick={handleRetry}
        className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-body hover:bg-red-600 transition-colors"
      >
        Try again
      </button>
    </div>
  );

  return (
    <div className="space-y-3">
      <label className="block font-heading text-sm font-medium text-charcoal-600">
        {label}
      </label>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onFileSelect}
        className="hidden"
        tabIndex={-1}
      />

      {status === "idle" && renderDropZone()}
      {status === "uploading" && renderUploading()}
      {status === "success" && renderSuccess()}
      {status === "error" && renderError()}

      {/* Hidden file URL for form submission */}
      {previewUrl && (
        <input type="hidden" name="image" value={previewUrl} />
      )}
    </div>
  );
}

export default ImageUpload;
