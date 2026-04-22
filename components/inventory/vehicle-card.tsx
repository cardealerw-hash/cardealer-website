import Image from "next/image";
import Link from "next/link";
import { CircleGauge, Cog, Fuel } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategorySummary } from "@/lib/data/filters";
import { cn, formatCurrency, formatMileage } from "@/lib/utils";
import type { Vehicle } from "@/types/dealership";

export function VehicleCard({
  vehicle,
  variant = "default",
}: {
  vehicle: Vehicle;
  variant?: "default" | "related";
}) {
  const primaryImage = vehicle.heroImageUrl || vehicle.images[0]?.imageUrl;
  const isRelated = variant === "related";

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden bg-surface transition-all duration-300 ease-out hover:-translate-y-1",
        isRelated
          ? "rounded-[26px] shadow-[0_12px_30px_rgba(28,35,43,0.05)] hover:shadow-[0_18px_38px_rgba(28,35,43,0.08)]"
          : "rounded-[24px] border border-border shadow-[0_12px_30px_rgba(28,35,43,0.05)] hover:shadow-[0_18px_38px_rgba(28,35,43,0.08)]",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-elevated">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={vehicle.title}
            fill
            sizes="(min-width: 1280px) 353px, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm font-medium text-text-secondary">
            Gallery coming soon
          </div>
        )}

        {!isRelated ? (
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {vehicle.featured ? (
              <Badge variant="default" className="bg-accent/92 px-3 py-1.5 text-[0.65rem] tracking-[0.18em] shadow-none">
                Featured
              </Badge>
            ) : null}
            {vehicle.negotiable ? (
              <Badge variant="muted" className="px-3 py-1.5 text-[0.65rem] tracking-[0.18em] shadow-none">
                Negotiable
              </Badge>
            ) : null}
            {vehicle.status === "sold" ? (
              <Badge variant="success" className="px-3 py-1.5 text-[0.65rem] tracking-[0.18em] shadow-none">
                Sold
              </Badge>
            ) : null}
          </div>
        ) : vehicle.negotiable ? (
          <div className="absolute left-4 top-4">
            <Badge variant="muted" className="px-3 py-1.5 text-[0.65rem] tracking-[0.18em] shadow-none">
              Negotiable
            </Badge>
          </div>
        ) : null}
      </div>

      <div className={cn("flex flex-1 flex-col", isRelated ? "p-4 sm:p-5" : "p-5 sm:p-6")}>
        <div className={cn("flex items-start gap-3", isRelated ? "mb-3 flex-col" : "mb-4 justify-between")}>
          <div className="min-w-0">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-text-secondary">
              {vehicle.year} - {getCategorySummary(vehicle)}
            </p>
            <h3
              className={cn(
                "mt-1 font-semibold leading-tight text-text-primary",
                isRelated ? "line-clamp-2 text-[1.05rem]" : "line-clamp-2 text-lg sm:text-xl",
              )}
            >
              {vehicle.title}
            </h3>
          </div>
          <p className={cn("shrink-0 text-accent", isRelated ? "text-xl font-black" : "text-right text-lg font-black sm:text-xl")}>
            {formatCurrency(vehicle.price)}
          </p>
        </div>

        <div
          className={cn(
            "mb-5 text-sm font-medium text-text-secondary",
            isRelated
              ? "flex flex-wrap gap-x-4 gap-y-2 border-t border-border/35 pt-4"
              : "grid grid-cols-3 gap-2 border-t border-border/70 pt-5",
          )}
        >
          <div className={cn("flex gap-2", isRelated ? "items-center" : "flex-col items-center text-center")}>
            <CircleGauge className="size-4 text-text-secondary/70" />
            <span className={cn("leading-tight", isRelated ? "text-[0.82rem]" : "w-full truncate text-[0.75rem]")}>
              {vehicle.mileage > 0 ? formatMileage(vehicle.mileage) : "0 km"}
            </span>
          </div>
          <div className={cn("flex gap-2", isRelated ? "items-center" : "flex-col items-center border-l border-border/70 text-center")}>
            <Cog className="size-4 text-text-secondary/70" />
            <span className={cn("leading-tight", isRelated ? "text-[0.82rem]" : "w-full truncate text-[0.75rem]")}>
              {vehicle.transmission}
            </span>
          </div>
          <div className={cn("flex gap-2", isRelated ? "items-center" : "flex-col items-center border-l border-border/70 text-center")}>
            <Fuel className="size-4 text-text-secondary/70" />
            <span className={cn("leading-tight", isRelated ? "text-[0.82rem]" : "w-full truncate text-[0.75rem]")}>
              {vehicle.fuelType}
            </span>
          </div>
        </div>

        <Button asChild className={cn("mt-auto w-full text-[0.85rem]", isRelated ? "h-10 rounded-2xl" : "h-11 rounded-xl")}>
          <Link href={`/cars/${vehicle.slug}`}>View Details</Link>
        </Button>
      </div>
    </article>
  );
}
