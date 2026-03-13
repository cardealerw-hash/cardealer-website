import Image from "next/image";
import Link from "next/link";
import { CircleGauge, Cog, Fuel } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategorySummary } from "@/lib/data/filters";
import { formatCurrency, formatMileage } from "@/lib/utils";
import type { Vehicle } from "@/types/dealership";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const primaryImage = vehicle.heroImageUrl || vehicle.images[0]?.imageUrl;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-border bg-surface shadow-[0_12px_30px_rgba(28,35,43,0.05)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(28,35,43,0.08)]">
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
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-text-secondary">
              {vehicle.year} - {getCategorySummary(vehicle)}
            </p>
            <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-tight text-text-primary sm:text-xl">
              {vehicle.title}
            </h3>
          </div>
          <p className="shrink-0 text-right text-lg font-black text-accent sm:text-xl">
            {formatCurrency(vehicle.price)}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-2 border-t border-border/70 pt-5 text-sm font-medium text-text-secondary">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <CircleGauge className="size-4 text-text-secondary/70" />
            <span className="w-full truncate text-[0.75rem] leading-tight">
              {vehicle.mileage > 0 ? formatMileage(vehicle.mileage) : "0 km"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5 border-l border-border/70 text-center">
            <Cog className="size-4 text-text-secondary/70" />
            <span className="w-full truncate text-[0.75rem] leading-tight">
              {vehicle.transmission}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5 border-l border-border/70 text-center">
            <Fuel className="size-4 text-text-secondary/70" />
            <span className="w-full truncate text-[0.75rem] leading-tight">
              {vehicle.fuelType}
            </span>
          </div>
        </div>

        <Button asChild className="mt-auto h-11 w-full rounded-xl text-[0.85rem]">
          <Link href={`/cars/${vehicle.slug}`}>View Details</Link>
        </Button>
      </div>
    </article>
  );
}
