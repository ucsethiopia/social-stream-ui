/* eslint-disable @next/next/no-img-element -- post images are arbitrary B2/CDN or blob: URLs; next/image can't optimise blob: */
import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function RemoteImage({ className, alt = "", ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return <img alt={alt} loading="lazy" decoding="async" draggable={false} className={cn("object-cover", className)} {...props} />;
}
