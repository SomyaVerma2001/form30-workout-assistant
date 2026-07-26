import type { CSSProperties, ImgHTMLAttributes } from "react";

type StaticImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string | { src: string };
  fill?: boolean;
  priority?: boolean;
};

export default function StaticImage({
  src,
  fill,
  priority,
  style,
  ...props
}: StaticImageProps) {
  const source = typeof src === "string" ? src : src.src;
  const resolvedSource = source.startsWith("/")
    ? `${import.meta.env.BASE_URL}${source.slice(1)}`
    : source;
  const fillStyle: CSSProperties | undefined = fill
    ? { height: "100%", inset: 0, position: "absolute", width: "100%", ...style }
    : style;

  return (
    <img
      {...props}
      src={resolvedSource}
      style={fillStyle}
      loading={priority ? "eager" : props.loading}
    />
  );
}
