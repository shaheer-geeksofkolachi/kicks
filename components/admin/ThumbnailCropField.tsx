"use client";

import Cropper, { type Area } from "react-easy-crop";
import { useCallback, useEffect, useRef, useState } from "react";
import { blobToFile, getCroppedImageBlob } from "@/lib/crop-image";

type ThumbnailCropFieldProps = {
  file: File | null;
  onChange: (file: File | null) => void;
};

export function ThumbnailCropField({ file, onChange }: ThumbnailCropFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState("thumbnail.jpg");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked || !picked.type.startsWith("image/")) return;
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    const url = URL.createObjectURL(picked);
    setSourceUrl(url);
    setSourceName(picked.name.replace(/\.[^.]+$/, "") || "thumbnail");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setOpen(true);
  }

  async function applyCrop() {
    if (!sourceUrl || !croppedAreaPixels) return;
    const blob = await getCroppedImageBlob(sourceUrl, croppedAreaPixels);
    const cropped = blobToFile(blob, `${sourceName}-thumbnail.jpg`);
    onChange(cropped);
    setOpen(false);
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(null);
  }

  function cancelCrop() {
    setOpen(false);
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(null);
  }

  function clearThumbnail() {
    onChange(null);
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onPickFile}
      />

      <div className="flex flex-wrap items-start gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-dashed border-zinc-600 bg-[#141414] px-4 py-3 text-sm font-medium text-zinc-200 transition hover:border-[#FF8C00]/50"
        >
          {file ? "Replace thumbnail" : "Choose thumbnail image"}
        </button>
        {file && (
          <button
            type="button"
            onClick={clearThumbnail}
            className="text-sm text-red-300 hover:text-red-200"
          >
            Remove thumbnail
          </button>
        )}
      </div>

      {file && previewUrl && (
        <div className="flex items-start gap-3">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-[#FF8C00]/40 ring-2 ring-[#FF8C00]/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Thumbnail preview" className="h-full w-full object-cover" />
          </div>
          <p className="text-xs leading-relaxed text-zinc-500">
            This square crop is saved as the <strong className="text-zinc-400">first</strong> catalog image
            (sort index 0). Gallery uploads below are added after it.
          </p>
        </div>
      )}

      {open && sourceUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="crop-thumbnail-title"
        >
          <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-zinc-700 bg-[#141414]">
            <div className="border-b border-zinc-800 px-4 py-3">
              <h2 id="crop-thumbnail-title" className="text-sm font-semibold text-white">
                Crop thumbnail (1:1)
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">Drag to reposition · scroll or slider to zoom</p>
            </div>
            <div className="relative h-[min(60vh,360px)] w-full bg-black">
              <Cropper
                image={sourceUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="space-y-2 px-4 py-3">
              <label className="flex items-center gap-3 text-xs text-zinc-400">
                Zoom
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-[#FF8C00]"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-800 px-4 py-3">
              <button
                type="button"
                onClick={cancelCrop}
                className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void applyCrop()}
                disabled={!croppedAreaPixels}
                className="rounded-lg bg-[#FF8C00] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
              >
                Use crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
