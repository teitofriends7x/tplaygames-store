"use client";

import Image from "next/image";
import { Maximize2, X } from "lucide-react";
import { useState } from "react";

import type { ProductImage } from "@/lib/types";

const fallbackBlur =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTIwMCcgaGVpZ2h0PSc5MDAnIHZpZXdCb3g9JzAgMCAxMjAwIDkwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cmVjdCB3aWR0aD0nMTIwMCcgaGVpZ2h0PSc5MDAnIGZpbGw9JyMxMTEzMTgnLz48Y2lyY2xlIGN4PSc2MDAnIGN5PSczNTAnIHI9JzQyMCcgZmlsbD0nIzFENkRGRicgZmlsbC1vcGFjaXR5PScwLjE2Jy8+PC9zdmc+";

export function ProductGallery({
  images,
  name,
}: {
  images: ProductImage[];
  name: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const active = images[activeIndex] ?? images[0];

  return (
    <div className="space-y-4">
      <div className="tpg-card group relative aspect-[4/3] overflow-hidden">
        {active ? (
          <Image
            src={active.url}
            alt={active.alt}
            fill
            unoptimized
            priority
            sizes="(max-width: 1024px) 100vw, 760px"
            placeholder="blur"
            blurDataURL={active.blurDataUrl ?? fallbackBlur}
            className="object-contain p-4 transition duration-300 group-hover:scale-[1.015]"
          />
        ) : (
          <div className="grid h-full place-items-center text-[#A7ACB8]">
            Imagen no disponible
          </div>
        )}
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="icon-button absolute right-4 top-4 bg-black/45 text-white"
          aria-label={`Ampliar imagen de ${name}`}
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((image, index) => (
            <button
              type="button"
              key={image.id}
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-square overflow-hidden rounded-xl border bg-[#111318] transition ${
                index === activeIndex
                  ? "border-[#1D6DFF] ring-2 ring-[#1D6DFF]/30"
                  : "border-white/10 hover:border-white/30"
              }`}
              aria-label={`Ver imagen ${index + 1} de ${name}`}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                unoptimized
                sizes="140px"
                placeholder="blur"
                blurDataURL={image.blurDataUrl ?? fallbackBlur}
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      ) : null}
      {zoomOpen && active ? (
        <div
          className="fixed inset-0 z-[90] grid place-items-center bg-black/88 p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            className="icon-button absolute right-4 top-4 text-white"
            aria-label="Cerrar ampliación"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative aspect-[4/3] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#111318]">
            <Image
              src={active.url}
              alt={active.alt}
              fill
              unoptimized
              sizes="100vw"
              placeholder="blur"
              blurDataURL={active.blurDataUrl ?? fallbackBlur}
              className="object-contain"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
