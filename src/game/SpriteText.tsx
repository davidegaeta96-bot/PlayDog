
import { IMAGES } from "./assets";
import { bboxOf } from "./bbox";

export function PixelImg({
  src,
  gh,
  gw,
  alt = "",
  className = "",
  style,
}: {
  src: any;
  gh: number;
  gw?: number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties | undefined;
}) {
  let imageSrc = src;
  if (typeof src === "object" && src !== null) {
    imageSrc = src.url || src.src || src.default || "";
  }

  const bb = bboxOf(imageSrc);
  if (!bb) {
    return (
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        style={{ height: gh, width: gw, imageRendering: "pixelated", ...style }}
      />
    );
  }
  const [w, h, x, y, cw, ch] = bb;
  const boxH = gh;
  const boxW = gw ?? (cw / ch) * gh;
  const sx = boxW / cw;
  const sy = boxH / ch;
  return (
    <span
      className={className}
      style={{
        position: "relative",
        display: "inline-block",
        width: boxW,
        height: boxH,
        overflow: "visible",
        pointerEvents: "none",
        flex: "none",
        ...style,
      }}
    >
      <img
        src={imageSrc}
        alt={alt}
        style={{
          position: "absolute",
          left: -x * sx,
          top: -y * sy,
          width: w * sx,
          height: h * sy,
          maxWidth: "none",
          maxHeight: "none",
          imageRendering: "pixelated",
        }}
      />
    </span>
  );
}

export function SpriteWord({
  src,
  text,
  height = 32,
  className = "",
}: {
  src: any;
  text: string;
  height?: number;
  className?: string;
}) {
  if (src) return <PixelImg src={src} gh={height} alt={text} className={className} />;
  return (
    <span
      className={`select-none font-pixel uppercase leading-none tracking-widest ${className}`}
      style={{ fontSize: height }}
    >
      {text}
    </span>
  );
}

export function SpriteNumber({
  value,
  height = 32,
  suffix,
  yellow = false,
  className = "",
}: {
  value: number;
  height?: number;
  suffix?: "percent";
  yellow?: boolean;
  className?: string;
}) {
  const chars = String(Math.round(value)).split("");
  const set = yellow ? (IMAGES as any).digitsYellow : (IMAGES as any).digits;
  const gap = Math.max(2, Math.round(height * 0.22));
  return (
    <span
      className={`inline-flex items-end ${className}`}
      style={{ gap, lineHeight: 1 }}
    >
      {chars.map((c, i) => {
        const img = set ? set[c] : undefined;
        return img ? (
          <PixelImg key={i} src={img} gh={height} alt={c} />
        ) : (
          <span key={i} className="font-pixel leading-none" style={{ fontSize: height }}>
            {c}
          </span>
        );
      })}
      {suffix === "percent" &&
        ((IMAGES as any).percent ? (
          <PixelImg src={(IMAGES as any).percent} gh={height} alt="%" />
        ) : (
          <span className="font-pixel leading-none" style={{ fontSize: height }}>
            %
          </span>
        ))}
    </span>
  );
}

export function SpriteText(props: any) {
  return <SpriteNumber {...props} />;
}