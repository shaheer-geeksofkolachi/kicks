export type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CropMediaSize = {
  naturalWidth: number;
  naturalHeight: number;
};

function clampCrop(crop: PixelCrop, maxW: number, maxH: number): PixelCrop {
  const x = Math.max(0, Math.min(Math.round(crop.x), maxW - 1));
  const y = Math.max(0, Math.min(Math.round(crop.y), maxH - 1));
  const width = Math.max(1, Math.min(Math.round(crop.width), maxW - x));
  const height = Math.max(1, Math.min(Math.round(crop.height), maxH - y));
  return { x, y, width, height };
}

function scaleCrop(crop: PixelCrop, scaleX: number, scaleY: number): PixelCrop {
  return {
    x: crop.x * scaleX,
    y: crop.y * scaleY,
    width: crop.width * scaleX,
    height: crop.height * scaleY,
  };
}

export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: PixelCrop,
  mediaSize?: CropMediaSize,
  mimeType = "image/jpeg",
  quality = 0.92,
): Promise<Blob> {
  const response = await fetch(imageSrc);
  const inputBlob = await response.blob();

  let source: CanvasImageSource;
  let sourceWidth: number;
  let sourceHeight: number;
  let bitmap: ImageBitmap | null = null;

  try {
    if (typeof createImageBitmap === "function") {
      bitmap = await createImageBitmap(inputBlob, { imageOrientation: "from-image" });
      source = bitmap;
      sourceWidth = bitmap.width;
      sourceHeight = bitmap.height;
    } else {
      const image = await loadImage(imageSrc);
      source = image;
      sourceWidth = image.naturalWidth;
      sourceHeight = image.naturalHeight;
    }

    let crop = pixelCrop;
    if (
      mediaSize &&
      mediaSize.naturalWidth > 0 &&
      mediaSize.naturalHeight > 0 &&
      (sourceWidth !== mediaSize.naturalWidth || sourceHeight !== mediaSize.naturalHeight)
    ) {
      crop = scaleCrop(
        crop,
        sourceWidth / mediaSize.naturalWidth,
        sourceHeight / mediaSize.naturalHeight,
      );
    }

    crop = clampCrop(crop, sourceWidth, sourceHeight);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not create canvas");
    }

    canvas.width = crop.width;
    canvas.height = crop.height;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      source,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height,
    );

    return await canvasToBlob(canvas, mimeType, quality);
  } finally {
    bitmap?.close();
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () => reject(new Error("Failed to load image")));
    img.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Crop failed"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}
