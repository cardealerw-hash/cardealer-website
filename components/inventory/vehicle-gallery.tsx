"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { buildCloudinaryTransformedUrl } from "@/lib/cloudinary-images";
import { cn } from "@/lib/utils";
import type { VehicleImage } from "@/types/dealership";

type GalleryImage = VehicleImage;

function normalizeGalleryImages(
  images: VehicleImage[],
  title: string,
  heroImageUrl?: string | null,
) {
  const sortedImages = [...images].sort((left, right) => {
    if (left.isHero !== right.isHero) {
      return Number(right.isHero) - Number(left.isHero);
    }

    return left.sortOrder - right.sortOrder;
  });

  const seededImages =
    heroImageUrl && !sortedImages.some((image) => image.imageUrl === heroImageUrl)
      ? [
          {
            id: `${title}-hero`,
            vehicleId: "",
            imageUrl: heroImageUrl,
            altText: `${title} hero image`,
            cloudinaryPublicId: null,
            sortOrder: -1,
            isHero: true,
            createdAt: "",
          } satisfies VehicleImage,
          ...sortedImages,
        ]
      : sortedImages;

  const seen = new Set<string>();

  return seededImages.filter((image) => {
    const key = image.cloudinaryPublicId || image.imageUrl;

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function getGalleryAltText(
  image: GalleryImage,
  index: number,
  title: string,
) {
  return image.altText?.trim() || `${title} photo ${index + 1}`;
}

function getGalleryImageUrl(
  image: GalleryImage,
  variant: "hero" | "thumb",
) {
  return buildCloudinaryTransformedUrl(image.imageUrl, {
    width: variant === "hero" ? 1600 : 360,
    height: variant === "hero" ? 1200 : 270,
    crop: "fill",
    gravity: "auto",
  });
}

export function VehicleGallery({
  images,
  heroImageUrl,
  title,
}: {
  images: VehicleImage[];
  heroImageUrl?: string | null;
  title: string;
}) {
  const galleryImages = normalizeGalleryImages(images, title, heroImageUrl);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = galleryImages[activeIndex] || galleryImages[0];
  const primaryImage = activeImage ? getGalleryImageUrl(activeImage, "hero") : null;

  if (!primaryImage) {
    return (
      <div className="rounded-[32px] border border-border bg-surface p-10 text-center shadow-[0_12px_30px_rgba(28,35,43,0.05)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
          Photos coming soon
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-text-primary">{title}</h2>
        <p className="mt-4 text-sm leading-7 text-text-secondary">
          We are still preparing the photo gallery for this vehicle. Contact
          sales for current photos, availability, and viewing details.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[36px] border border-border bg-surface shadow-[0_12px_30px_rgba(28,35,43,0.05)] selection:bg-transparent">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={primaryImage}
            alt={getGalleryAltText(activeImage, activeIndex, title)}
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[rgba(28,35,43,0.42)] via-[rgba(28,35,43,0.08)] to-transparent" />
          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3">
            <div className="rounded-full border border-white/60 bg-white/86 px-3.5 py-1.5 text-xs font-semibold tracking-[0.08em] text-text-primary backdrop-blur-sm">
              {activeIndex + 1} / {galleryImages.length} photos
            </div>
            {galleryImages.length > 1 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-white/65 bg-white/86 text-text-primary shadow-[0_10px_24px_rgba(28,35,43,0.1)] backdrop-blur-md transition-colors hover:bg-white"
                  aria-label="Show previous photo"
                  onClick={() =>
                    setActiveIndex(
                      (current) =>
                        (current - 1 + galleryImages.length) % galleryImages.length,
                    )
                  }
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-white/65 bg-white/86 text-text-primary shadow-[0_10px_24px_rgba(28,35,43,0.1)] backdrop-blur-md transition-colors hover:bg-white"
                  aria-label="Show next photo"
                  onClick={() =>
                    setActiveIndex(
                      (current) => (current + 1) % galleryImages.length,
                    )
                  }
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {galleryImages.length > 1 ? (
        <div className="hide-scrollbar flex gap-4 overflow-x-auto px-1 pb-2">
          {galleryImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className={cn(
                "relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-[20px] border shadow-sm transition-all",
                activeImage?.id === image.id
                  ? "border-accent ring-2 ring-accent/15"
                  : "border-border hover:border-accent/40 hover:shadow-md",
              )}
              aria-label={`Show photo ${index + 1} of ${galleryImages.length}`}
              aria-pressed={activeImage?.id === image.id}
              onClick={() => setActiveIndex(index)}
            >
              <Image
                src={getGalleryImageUrl(image, "thumb")}
                alt={getGalleryAltText(image, index, title)}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
