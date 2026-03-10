"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type HeroRailItem = {
  id: string;
  title: string;
  year: string;
  priceLabel: string;
  imageUrl: string | null;
  detailsUrl: string;
  stockLabel: string;
};

type HeroRailItemWithImage = HeroRailItem & {
  imageUrl: string;
};

const zoneTwoClipPath = "polygon(24% 0, 100% 0, 100% 100%, 0 100%)";

function hasImage(item: HeroRailItem): item is HeroRailItemWithImage {
  return Boolean(item.imageUrl);
}

export function HomeHeroVisual({ items }: { items: HeroRailItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const imageItems = items.filter(hasImage);
  const rotatingItems = imageItems.length ? imageItems : items;
  const activeItem = rotatingItems.length
    ? rotatingItems[activeIndex % rotatingItems.length]
    : null;
  const mobileItem = rotatingItems[0] || items[0] || null;

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncMediaState = () => {
      setIsDesktop(desktopQuery.matches);
      setPrefersReducedMotion(reducedMotionQuery.matches);
    };

    syncMediaState();

    desktopQuery.addEventListener("change", syncMediaState);
    reducedMotionQuery.addEventListener("change", syncMediaState);

    return () => {
      desktopQuery.removeEventListener("change", syncMediaState);
      reducedMotionQuery.removeEventListener("change", syncMediaState);
    };
  }, []);

  useEffect(() => {
    if (!isDesktop || prefersReducedMotion || rotatingItems.length <= 1) {
      return;
    }

    const rotation = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % rotatingItems.length);
    }, 5000);

    return () => window.clearInterval(rotation);
  }, [isDesktop, prefersReducedMotion, rotatingItems.length]);

  return (
    <div className="relative mx-auto w-full max-w-[780px]">
      <div className="relative min-h-[320px] sm:min-h-[370px] lg:min-h-[500px]">
        <div className="absolute inset-y-3 left-[8%] right-0 sm:left-[11%] lg:left-[18%]">
          <div
            className="absolute inset-0 overflow-hidden bg-[linear-gradient(135deg,rgba(229,222,213,0.98),rgba(205,196,184,0.9))] shadow-[0_24px_48px_rgba(61,39,14,0.14)]"
            style={{ clipPath: zoneTwoClipPath }}
          >
            {imageItems.length ? (
              imageItems.map((item, index) => {
                const isActive = activeItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    className={`absolute inset-0 transition-opacity duration-[1800ms] ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={`${item.year} ${item.title}`}
                      fill
                      priority={index === 0}
                      sizes="(min-width: 1280px) 42vw, (min-width: 1024px) 46vw, 100vw"
                      className={`object-cover object-center transition-transform duration-[5000ms] ${
                        isActive && isDesktop && !prefersReducedMotion
                          ? "scale-[1.03]"
                          : "scale-100"
                      }`}
                    />
                  </div>
                );
              })
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_32%,rgba(255,255,255,0.4),transparent_22%),linear-gradient(125deg,rgba(230,223,214,0.95),rgba(193,183,170,0.92))]" />
            )}

            <div className="absolute inset-0 bg-[linear-gradient(92deg,rgba(242,235,227,0.78)_0%,rgba(242,235,227,0.26)_25%,rgba(15,12,10,0.42)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(255,255,255,0.26),transparent_28%),radial-gradient(circle_at_82%_78%,rgba(255,255,255,0.14),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.14),transparent_44%,rgba(255,255,255,0.04)_72%,transparent_100%)]" />
          </div>

          <div className="pointer-events-none absolute left-[24%] right-0 top-0 h-px bg-stone-900/36" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-stone-900/30" />

          {imageItems.length > 1 ? (
            <div className="absolute bottom-5 right-4 z-20 hidden items-center gap-2 lg:flex">
              {imageItems.map((item) => {
                const isActive = activeItem?.id === item.id;

                return (
                  <span
                    key={item.id}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      isActive ? "w-7 bg-white/92" : "w-2.5 bg-white/40"
                    }`}
                  />
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="absolute left-[-6%] top-[14%] z-20 h-32 w-32 sm:left-[-2%] sm:h-40 sm:w-40 lg:left-[-12%] lg:top-[13%] lg:h-[13rem] lg:w-[13rem]">
          <div className="absolute inset-[-8%] rounded-full border border-primary/18" />
          <div className="absolute inset-0 rounded-full border border-white/80 bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.98),rgba(244,238,231,0.76)_54%,rgba(225,215,203,0.36)_100%)] shadow-[0_18px_36px_rgba(61,39,14,0.14)]" />
          <div className="absolute inset-[12%] rounded-full border border-white/65 bg-[radial-gradient(circle_at_34%_28%,rgba(255,255,255,0.92),rgba(241,233,222,0.74)_56%,rgba(225,214,202,0.28)_100%)]" />

          <Image
            src="/carHero.png"
            alt=""
            width={900}
            height={580}
            priority
            className="pointer-events-none absolute left-[-34%] top-[38%] z-30 w-[118%] max-w-none object-contain drop-shadow-[0_16px_20px_rgba(20,15,11,0.2)]"
          />
          <div className="pointer-events-none absolute bottom-[16%] left-[6%] z-10 h-6 w-[60%] rounded-full bg-[radial-gradient(circle,rgba(28,22,17,0.18),rgba(28,22,17,0.04)_60%,transparent_100%)] blur-xl" />
        </div>
      </div>

      {mobileItem ? (
        <Link
          href={mobileItem.detailsUrl}
          className="mt-4 flex items-center justify-between gap-3 rounded-[24px] border border-white/75 bg-white/92 px-4 py-3 shadow-[0_14px_28px_rgba(61,39,14,0.08)] backdrop-blur lg:hidden"
        >
          <div className="min-w-0">
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-primary">
              {mobileItem.stockLabel}
            </p>
            <h3 className="mt-1 text-sm font-semibold leading-tight text-stone-950">
              {mobileItem.year} {mobileItem.title}
            </h3>
          </div>
          <p className="shrink-0 text-sm font-bold text-stone-900">
            {mobileItem.priceLabel}
          </p>
        </Link>
      ) : null}
    </div>
  );
}
