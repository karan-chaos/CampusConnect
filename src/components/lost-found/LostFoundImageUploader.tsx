import { useState, useCallback, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import ImagePlus from "lucide-react/dist/esm/icons/image-plus";
import X from "lucide-react/dist/esm/icons/x";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import ZoomIn from "lucide-react/dist/esm/icons/zoom-in";
import ZoomOut from "lucide-react/dist/esm/icons/zoom-out";
import RotateCw from "lucide-react/dist/esm/icons/rotate-cw";
import Crop from "lucide-react/dist/esm/icons/crop";
import Upload from "lucide-react/dist/esm/icons/upload";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LostFoundImageUploaderProps {
  onImageUploaded: (url: string) => void;
  onImageRemoved: () => void;
  currentImageUrl: string | null;
  disabled?: boolean;
  maxFileSizeMB?: number;
  acceptedTypes?: string[];
}

interface ImagePreview {
  file: File;
  objectUrl: string;
  width: number;
  height: number;
}

interface CropSettings {
  zoom: number;
  rotation: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const IMAGE_BUCKET = "lost-found-images";
const MAX_DIMENSION = 2048;

// ─── Helper: Read file as data URL ────────────────────────────────────────────

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Helper: Resize image via canvas ──────────────────────────────────────────

function resizeImage(
  img: HTMLImageElement,
  maxDim: number,
  rotation: number,
  zoom: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Canvas not supported"));

    let { naturalWidth: w, naturalHeight: h } = img;

    // Apply rotation (90/180/270)
    const rotDeg = rotation % 360;
    if (rotDeg === 90 || rotDeg === 270) {
      [w, h] = [h, w];
    }

    // Apply zoom
    const zoomedW = Math.round(w * zoom);
    const zoomedH = Math.round(h * zoom);

    // Scale down to max dimension
    const scale = Math.min(1, maxDim / Math.max(zoomedW, zoomedH));
    const finalW = Math.round(zoomedW * scale);
    const finalH = Math.round(zoomedH * scale);

    canvas.width = finalW;
    canvas.height = finalH;

    ctx.translate(finalW / 2, finalH / 2);
    ctx.rotate((rotDeg * Math.PI) / 180);
    ctx.drawImage(img, -zoomedW / 2, -zoomedH / 2, zoomedW, zoomedH);

    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      },
      "image/jpeg",
      0.85,
    );
  });
}

// ─── Crop Preview Component ───────────────────────────────────────────────────

function CropPreview({
  image,
  crop,
  onApply,
  onCancel,
}: {
  image: ImagePreview;
  crop: CropSettings;
  onApply: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const [processing, setProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleApply = useCallback(async () => {
    if (!imgRef.current) return;
    setProcessing(true);
    try {
      const blob = await resizeImage(imgRef.current, MAX_DIMENSION, crop.rotation, crop.zoom);
      onApply(blob);
    } catch {
      toast.error("Failed to process image.");
    } finally {
      setProcessing(false);
    }
  }, [crop, onApply]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-lg border-2 border-black bg-black/5">
        <img
          ref={imgRef}
          src={image.objectUrl}
          alt="Crop preview"
          className="w-full max-h-[300px] object-contain"
          style={{
            transform: `scale(${crop.zoom}) rotate(${crop.rotation}deg)`,
            transition: "transform 0.2s ease",
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-black/50">Zoom: {crop.zoom.toFixed(1)}x</span>
          <span className="text-[10px] font-bold uppercase text-black/50">Rot: {crop.rotation}°</span>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-2 border-black text-[10px]"
            onClick={onCancel}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="bg-lime border-2 border-black font-mono text-[10px] font-black uppercase"
            onClick={handleApply}
            disabled={processing}
          >
            {processing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3 mr-1" />}
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Uploader Component ──────────────────────────────────────────────────

export default function LostFoundImageUploader({
  onImageUploaded,
  onImageRemoved,
  currentImageUrl,
  disabled = false,
  maxFileSizeMB = DEFAULT_MAX_SIZE_MB,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
}: LostFoundImageUploaderProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ImagePreview | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [cropSettings, setCropSettings] = useState<CropSettings>({ zoom: 1, rotation: 0 });

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.objectUrl);
    };
  }, [preview]);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedTypes.includes(file.type)) {
        return `Unsupported file type. Accepted: ${acceptedTypes.map((t) => t.split("/")[1]).join(", ")}`;
      }
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        return `File too large. Max size: ${maxFileSizeMB}MB`;
      }
      return null;
    },
    [acceptedTypes, maxFileSizeMB],
  );

  const handleFile = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }

      const objectUrl = URL.createObjectURL(file);

      // Get natural dimensions
      const img = new Image();
      img.onload = () => {
        setPreview({ file, objectUrl, width: img.naturalWidth, height: img.naturalHeight });
        setCropSettings({ zoom: 1, rotation: 0 });
      };
      img.src = objectUrl;
    },
    [validateFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile],
  );

  const handleCrop = useCallback((blob: Blob) => {
    const objectUrl = URL.createObjectURL(blob);
    const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev.objectUrl);
      return { file, objectUrl, width: 0, height: 0 };
    });
    setCropMode(false);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!preview) return;
    setUploading(true);

    try {
      const ext = preview.file.name.split(".").pop() || "jpg";
      const path = `items/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(path, preview.file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);

      if (!urlData?.publicUrl) throw new Error("Failed to get public URL");

      onImageUploaded(urlData.publicUrl);
      URL.revokeObjectURL(preview.objectUrl);
      setPreview(null);
      toast.success("Image uploaded successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }, [preview, supabase, onImageUploaded]);

  const handleRemovePreview = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview.objectUrl);
    setPreview(null);
    setCropMode(false);
  }, [preview]);

  const handleRemoveExisting = useCallback(() => {
    onImageRemoved();
  }, [onImageRemoved]);

  // ── Render: Existing image ───────────────────────────────────────────────────
  if (currentImageUrl && !preview) {
    return (
      <div className="relative group">
        <div className="relative overflow-hidden rounded-lg border-2 border-black">
          <img
            src={currentImageUrl}
            alt="Uploaded item"
            className="w-full max-h-[200px] object-cover"
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemoveExisting}
              className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="text-[10px] font-mono text-black/40 mt-1">Current image — click ✕ to remove</p>
      </div>
    );
  }

  // ── Render: Crop mode ────────────────────────────────────────────────────────
  if (cropMode && preview) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-black/60">Adjust Image</span>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 w-7 border-2 border-black p-0"
              onClick={() => setCropSettings((c) => ({ ...c, zoom: Math.max(0.5, c.zoom - 0.1) }))}
              aria-label="Zoom out"
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 w-7 border-2 border-black p-0"
              onClick={() => setCropSettings((c) => ({ ...c, zoom: Math.min(3, c.zoom + 0.1) }))}
              aria-label="Zoom in"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 w-7 border-2 border-black p-0"
              onClick={() => setCropSettings((c) => ({ ...c, rotation: (c.rotation + 90) % 360 }))}
              aria-label="Rotate"
            >
              <RotateCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <CropPreview image={preview} crop={cropSettings} onApply={handleCrop} onCancel={() => setCropMode(false)} />
      </div>
    );
  }

  // ── Render: Preview before upload ────────────────────────────────────────────
  if (preview) {
    return (
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-lg border-2 border-black">
          <img src={preview.objectUrl} alt="Preview" className="w-full max-h-[200px] object-cover" />
          <button
            type="button"
            onClick={handleRemovePreview}
            className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            aria-label="Remove preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 border-2 border-black font-mono text-[10px] font-black uppercase"
            onClick={() => setCropMode(true)}
          >
            <Crop className="h-3 w-3 mr-1" /> Adjust
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex-1 bg-lime border-2 border-black font-mono text-[10px] font-black uppercase"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Upload className="h-3 w-3 mr-1" />
            )}
            {uploading ? "Uploading…" : "Upload Image"}
          </Button>
        </div>
        <p className="text-[10px] font-mono text-black/40">
          {preview.file.name} — {(preview.file.size / 1024).toFixed(0)}KB
        </p>
      </div>
    );
  }

  // ── Render: Drop zone ────────────────────────────────────────────────────────
  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleInputChange}
        className="hidden"
        aria-label="Upload image"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-all ${
          dragOver
            ? "border-lime bg-lime/10 scale-[1.02]"
            : "border-black/20 bg-cream/50 hover:border-black/40 hover:bg-cream"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        aria-label="Drop image here or click to browse"
      >
        <div
          className={`rounded-full p-3 transition-colors ${
            dragOver ? "bg-lime text-black" : "bg-black/5 text-black/40"
          }`}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <ImagePlus className="h-6 w-6" />
          )}
        </div>
        <div className="text-center">
          <p className="font-mono text-sm font-black uppercase text-black/70">
            {dragOver ? "Drop here" : "Add Photo"}
          </p>
          <p className="mt-1 text-[10px] text-black/40">
            Drag & drop or <span className="font-bold text-black/60 underline">browse</span> — JPG, PNG, WebP (max {maxFileSizeMB}MB)
          </p>
        </div>
      </button>
    </div>
  );
}
