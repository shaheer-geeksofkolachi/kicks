"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type MediaUploadFieldProps = {
  files: File[];
  onChange: (files: File[]) => void;
};

function isImage(file: File) {
  return file.type.startsWith("image/");
}

function isVideo(file: File) {
  return file.type.startsWith("video/");
}

function PendingImagePreview({ file }: { file: File }) {
  const src = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => () => URL.revokeObjectURL(src), [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- local blob preview
    <img src={src} alt="" className="h-full w-full object-cover" />
  );
}

export function MediaUploadField({ files, onChange }: MediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function addFiles(incoming: FileList | File[]) {
    const list = Array.from(incoming).filter((f) => f.size > 0 && (isImage(f) || isVideo(f)));
    if (!list.length) return;
    onChange([...files, ...list]);
  }

  function removeAt(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="sr-only"
        onChange={onInputChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
        }}
        onDrop={onDrop}
        className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
          dragOver
            ? "border-[#FF8C00] bg-[#FF8C00]/10"
            : "border-zinc-600 bg-[#141414] hover:border-[#FF8C00]/50 hover:bg-[#1a1410]"
        }`}
      >
        <span className="text-sm font-medium text-zinc-200">Choose images or videos</span>
        <span className="mt-1 text-xs text-zinc-500">
          Select many at once, or drop files here — you can add more before saving
        </span>
        <span className="mt-4 rounded-lg bg-[#FF8C00] px-4 py-2 text-xs font-semibold text-black">
          Browse files
        </span>
      </button>

      {files.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-zinc-500">
            {files.length} file{files.length === 1 ? "" : "s"} ready to upload
          </p>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {files.map((file, index) => (
              <li key={`${file.name}-${file.size}-${index}`} className="relative aspect-square overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
                {isImage(file) ? (
                  <PendingImagePreview file={file} />
                ) : (
                  <div className="flex h-full items-center justify-center p-2 text-center text-[10px] text-zinc-400">
                    Video
                    <br />
                    {file.name}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="absolute top-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-red-300 hover:bg-black"
                  aria-label={`Remove ${file.name}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
