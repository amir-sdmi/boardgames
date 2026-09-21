/* eslint-disable @next/next/no-img-element */
import type { ImageProps } from "next/image";
export default function Image({
  src,
  alt,
  width,
  height,
  className,
}: ImageProps) {
  return (
    <img
      src={
        typeof src === "string" ? src : "src" in src ? src.src : src.default.src
      }
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}
