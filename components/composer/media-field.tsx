"use client";

import { Reorder } from "framer-motion";
import { ImagePlus } from "lucide-react";
import { useId, useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { MediaThumb } from "@/components/composer/media-thumb";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGES, type useImageUpload } from "@/hooks/use-image-upload";
import { cn } from "@/lib/utils";

type Media = ReturnType<typeof useImageUpload>;

function hasFiles(e: DragEvent) {
  return Array.from(e.dataTransfer.types).includes("Files");
}

export function MediaField({ media, readOnly }: { media: Media; readOnly: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const hintId = useId();
  const full = media.items.length >= MAX_IMAGES;

  const addFiles = (files: File[]) => {
    const errors = media.add(files);
    errors.forEach((message) => toast.error(message));
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!readOnly) addFiles(Array.from(e.dataTransfer.files));
  };

  const dropzone = (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={readOnly || full}
      className={cn(
        "flex items-center justify-center gap-3 rounded-lg border border-dashed text-sm text-muted-foreground transition-colors",
        "hover:border-foreground/30 hover:bg-accent/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        media.items.length ? "aspect-[4/3] w-26 flex-col sm:w-32 gap-1.5 text-xs" : "h-32 w-full flex-col",
        dragging && "border-brand bg-brand-soft text-foreground",
      )}
    >
      <ImagePlus className={media.items.length ? "size-5" : "size-6"} />
      {media.items.length ? (
        <span>Add image</span>
      ) : (
        <span className="flex flex-col items-center gap-0.5">
          <span className="font-medium text-foreground">Drop images, paste, or browse</span>
          <span className="text-xs">JPEG, PNG or WEBP up to 10 MB. The first image is the main image.</span>
        </span>
      )}
    </button>
  );

  return (
    <div
      onDragOver={(e) => {
        if (!hasFiles(e) || readOnly) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={onDrop}
      className={cn("rounded-xl transition-colors", dragging && media.items.length > 0 && "bg-brand-soft/60 outline-2 outline-brand outline-dashed")}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        multiple
        hidden
        onChange={(e) => {
          addFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      {media.items.length === 0 ? (
        dropzone
      ) : (
        <div className="p-1">
          <Reorder.Group axis="x" values={media.items} onReorder={media.setOrder} className="flex flex-wrap items-start gap-3" as="div">
            {media.items.map((item, index) => (
              <Reorder.Item key={item.key} value={item} as="div" dragListener={!readOnly} className={cn(!readOnly && "cursor-grab active:cursor-grabbing")} whileDrag={{ scale: 1.04, zIndex: 10 }}>
                <MediaThumb
                  item={item}
                  index={index}
                  total={media.items.length}
                  hintId={hintId}
                  onMove={(delta) => media.move(item.key, delta)}
                  isMain={index === 0}
                  readOnly={readOnly}
                  onRemove={() => media.remove(item.key)}
                  onRetry={() => media.retry(item.key)}
                  onMakeMain={() => media.makeMain(item.key)}
                />
              </Reorder.Item>
            ))}
            {!readOnly && !full && dropzone}
          </Reorder.Group>
        </div>
      )}
      {media.items.length > 1 && !readOnly && (
        <p id={hintId} className="mt-2 px-1 text-xs text-muted-foreground">
          Drag to reorder, or focus an image and use the arrow keys. Carousels follow this order.
        </p>
      )}
    </div>
  );
}
