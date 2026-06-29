"use client";

import { clsx } from "clsx";
import { portfolioClips } from "@/lib/config";

// Hero centerpiece: a fanned arc of rounded photo frames, each playing a muted,
// looping portfolio clip. Frames with no `src` yet show a labelled placeholder
// (swap real footage into `portfolioClips` in lib/config.ts).
//
// On small screens the arc collapses into a horizontal scroll strip.

// Slight rotation + vertical offset per frame to create the "fanned" arc look.
const ARC = [
  { rotate: -12, y: 26 },
  { rotate: -6, y: 8 },
  { rotate: 0, y: 0 },
  { rotate: 6, y: 8 },
  { rotate: 12, y: 26 },
];

const PLACEHOLDER_GRADIENTS = [
  "from-[#C9B79C] to-[#8E7C63]",
  "from-[#D8A48F] to-[#A86b54]",
  "from-[#9FAE93] to-[#6F7F66]",
  "from-[#C7B6A6] to-[#9b8675]",
  "from-[#D5C4A1] to-[#A99572]",
];

export function PhotoFrameGallery() {
  return (
    <div className="relative w-full">
      {/* Desktop: fanned arc */}
      <div className="hidden items-end justify-center gap-3 sm:flex">
        {portfolioClips.slice(0, 5).map((clip, i) => {
          const arc = ARC[i] ?? { rotate: 0, y: 0 };
          return (
            <Frame
              key={i}
              clip={clip}
              gradient={PLACEHOLDER_GRADIENTS[i % PLACEHOLDER_GRADIENTS.length]}
              style={{
                transform: `rotate(${arc.rotate}deg) translateY(${arc.y}px)`,
              }}
              className="w-[clamp(110px,15vw,170px)]"
            />
          );
        })}
      </div>

      {/* Mobile: horizontal scroll strip */}
      <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2 sm:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {portfolioClips.map((clip, i) => (
          <Frame
            key={i}
            clip={clip}
            gradient={PLACEHOLDER_GRADIENTS[i % PLACEHOLDER_GRADIENTS.length]}
            className="w-[140px] shrink-0"
          />
        ))}
      </div>
    </div>
  );
}

function Frame({
  clip,
  gradient,
  style,
  className,
}: {
  clip: { src: string; poster?: string; label: string };
  gradient: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <figure
      style={style}
      className={clsx(
        "group relative aspect-[3/4] overflow-hidden rounded-2xl bg-cream-300 shadow-frame ring-1 ring-black/5",
        className
      )}
    >
      {clip.src ? (
        <video
          className="h-full w-full object-cover"
          src={clip.src}
          poster={clip.poster}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <div
          className={clsx(
            "flex h-full w-full items-end bg-gradient-to-br p-3",
            gradient
          )}
        >
          <span className="rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-medium text-white/95 backdrop-blur-sm">
            {clip.label}
          </span>
        </div>
      )}
    </figure>
  );
}
