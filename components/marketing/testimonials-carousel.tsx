"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Review } from "@/types/dealership";

type TestimonialsCarouselProps = {
  reviews: Review[];
};

export function TestimonialsCarousel({
  reviews,
}: TestimonialsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function updateActiveIndex() {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const slides = Array.from(
      track.querySelectorAll<HTMLElement>("[data-slide]"),
    );

    if (!slides.length) {
      return;
    }

    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const distance = Math.abs(slideCenter - trackCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }

  function handleScroll() {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = window.requestAnimationFrame(() => {
      updateActiveIndex();
      frameRef.current = null;
    });
  }

  function scrollToIndex(index: number) {
    const track = trackRef.current;

    if (!track || reviews.length === 0) {
      return;
    }

    const safeIndex = (index + reviews.length) % reviews.length;
    const slide = track.querySelector<HTMLElement>(
      `[data-slide="${safeIndex}"]`,
    );

    slide?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
    setActiveIndex(safeIndex);
  }

  useEffect(() => {
    function handleResize() {
      updateActiveIndex();
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [reviews.length]);

  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 md:hidden">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent" />
        <div
          ref={trackRef}
          className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 pt-1 scroll-smooth [scroll-padding-inline:1rem]"
          onScroll={handleScroll}
        >
          {reviews.map((review, index) => (
            <Card
              key={review.id}
              data-slide={index}
              className="min-h-[250px] w-[88%] shrink-0 snap-start rounded-[30px] border-border/80 bg-surface p-6 shadow-[0_14px_32px_rgba(28,35,43,0.06)]"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-1 text-[#d4a53d]">
                  {Array.from({ length: 5 }, (_, starIndex) => (
                    <Star
                      key={`${review.id}-star-${starIndex}`}
                      className={
                        starIndex < review.rating
                          ? "size-4 fill-current"
                          : "size-4 text-border"
                      }
                    />
                  ))}
                </div>
                <p className="mt-4 text-lg leading-8 text-text-secondary">
                  &quot;{review.quote}&quot;
                </p>
                <div className="mt-auto pt-6">
                  <p className="font-semibold text-text-primary">
                    {review.customerName}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {review.vehicleLabel}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      {reviews.length > 1 ? (
        <div className="flex items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2">
            {reviews.map((review, index) => (
              <button
                key={review.id}
                type="button"
                className={
                  index === activeIndex
                    ? "h-2.5 w-6 rounded-full bg-accent transition-all"
                    : "h-2.5 w-2.5 rounded-full bg-border transition-all"
                }
                aria-label={`Show testimonial ${index + 1}`}
                aria-pressed={index === activeIndex}
                onClick={() => scrollToIndex(index)}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-10 w-10 rounded-full border-border bg-surface px-0 shadow-sm"
              aria-label="Previous testimonial"
              onClick={() => scrollToIndex(activeIndex - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-10 w-10 rounded-full border-border bg-surface px-0 shadow-sm"
              aria-label="Next testimonial"
              onClick={() => scrollToIndex(activeIndex + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
