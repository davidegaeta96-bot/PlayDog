import type { Img } from "./assets";
import { PixelImg } from "./SpriteText";

/**
 * Wrapper grafico: mostra il disegno reale (senza bordi trasparenti)
 * dentro le dimensioni richieste, altrimenti un segnaposto.
 */
export function Sprite({
  src,
  fallback,
  w,
  h,
  style,
  className = "",
}: {
  src: Img;
  fallback: string;
  w: number;
  h: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  if (src) {
    return <PixelImg src={src} gw={w} gh={h} className={className} style={style} />;
  }
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width: w, height: h, ...style }}
    >
      <span
        className="flex h-full w-full select-none items-center justify-center rounded bg-white leading-none text-black"
        style={{ fontSize: Math.min(w, h) * 0.75 }}
      >
        {fallback}
      </span>
    </div>
  );
}
