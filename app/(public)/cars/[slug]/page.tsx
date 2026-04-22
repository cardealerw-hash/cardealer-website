import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CarFront,
  CheckCircle2,
  Fuel,
  Gauge,
  Map,
  MapPin,
  Settings2,
  ShieldCheck,
  Star,
  type LucideIcon,
} from "lucide-react";
import { notFound } from "next/navigation";

import { VehicleEnquiryForm } from "@/components/forms/vehicle-enquiry-form";
import { MobileCtaBar } from "@/components/inventory/mobile-cta-bar";
import { ShareVehicleAction } from "@/components/inventory/share-vehicle-action";
import { VehicleCard } from "@/components/inventory/vehicle-card";
import { VehicleGallery } from "@/components/inventory/vehicle-gallery";
import { JsonLd } from "@/components/layout/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/config/site";
import {
  getReviews,
  getSimilarVehicles,
  getVehicleBySlug,
} from "@/lib/data/repository";
import {
  buildBreadcrumbJsonLd,
  buildMetadata,
  buildVehicleJsonLd,
} from "@/lib/seo";
import {
  absoluteUrl,
  buildWhatsAppUrl,
  formatCurrency,
  formatMileage,
} from "@/lib/utils";

type VehicleRecord = NonNullable<Awaited<ReturnType<typeof getVehicleBySlug>>>;

type HeroFact = {
  icon: LucideIcon;
  label: string;
  value: string;
};

type DetailRow = {
  label: string;
  value: string;
};

function buildDescriptionCopy(description?: string | null) {
  const fallback =
    "Contact sales for the latest photos, condition notes, and viewing guidance before you travel.";
  const normalized = description?.trim() || fallback;

  if (normalized.length <= 200) {
    return { preview: normalized, remainder: "" };
  }

  const sentences = normalized.split(/(?<=[.!?])\s+/).filter(Boolean);

  if (sentences.length > 1) {
    let preview = sentences[0];
    let index = 1;

    while (
      index < sentences.length &&
      preview.length < 200 &&
      preview.length + sentences[index].length + 1 <= 260
    ) {
      preview = `${preview} ${sentences[index]}`;
      index += 1;
    }

    return {
      preview,
      remainder: sentences.slice(index).join(" "),
    };
  }

  return {
    preview: `${normalized.slice(0, 200).trimEnd()}...`,
    remainder: normalized.slice(200).trimStart(),
  };
}

function buildStatusBadges(vehicle: VehicleRecord) {
  const stockLabel = (() => {
    switch (vehicle.stockCategory) {
      case "available_for_importation":
        return "Imported unit";
      case "imported":
        return "Imported";
      case "traded_in":
        return "Trade-in unit";
      default:
        return "Local listing";
    }
  })();

  return [
    {
      label: "Verified listing",
      variant: "success" as const,
    },
    {
      label: "Available now",
      variant: "accent" as const,
    },
    vehicle.negotiable
      ? {
        label: "Negotiable",
        variant: "muted" as const,
      }
      : null,
    {
      label: stockLabel,
      variant: "muted" as const,
    },
  ].filter(
    (
      value,
    ): value is {
      label: string;
      variant: "accent" | "muted" | "success";
    } => Boolean(value),
  );
}

function buildHeroFacts(vehicle: VehicleRecord): HeroFact[] {
  return [
    { icon: Calendar, label: "Year", value: String(vehicle.year) },
    {
      icon: Gauge,
      label: "Mileage",
      value: vehicle.mileage > 0 ? formatMileage(vehicle.mileage) : "On request",
    },
    {
      icon: Settings2,
      label: "Transmission",
      value: vehicle.transmission,
    },
    { icon: Fuel, label: "Fuel Type", value: vehicle.fuelType },
    { icon: Map, label: "Drive Type", value: vehicle.driveType || "On request" },
    { icon: CarFront, label: "Body Type", value: vehicle.bodyType || "On request" },
  ];
}

function buildStandoutHeading(vehicle: VehicleRecord) {
  return `Why this ${vehicle.model} stands out`;
}

function buildHeroTrustLine(vehicle: VehicleRecord) {
  const location = vehicle.location?.name || "Mombasa";

  return [
    `Viewing in ${location}`,
    "Fast response during working hours",
    "Trade-ins welcome",
  ];
}

function buildVehicleSummary(vehicle: VehicleRecord) {
  const mileage =
    vehicle.mileage > 0 ? `${formatMileage(vehicle.mileage)}` : "mileage shared on request";
  const drive = vehicle.driveType ? `, ${vehicle.driveType}` : "";

  return [
    `${vehicle.year} ${vehicle.make} ${vehicle.model} with ${mileage}, ${vehicle.fuelType.toLowerCase()} power, ${vehicle.transmission.toLowerCase()} transmission${drive}.`,
    "Comfortable for daily driving, family travel, and longer road trips, with viewing and paperwork support available in Mombasa.",
  ].join(" ");
}

function buildAboutHighlights(vehicle: VehicleRecord) {
  return [
    vehicle.condition
      ? `${vehicle.condition} condition notes can be confirmed before you leave for the viewing.`
      : "Ask sales for the latest condition notes before viewing.",
    vehicle.fuelType.toLowerCase() === "diesel"
      ? "Diesel running suits longer trips, highway use, and upcountry travel."
      : `${vehicle.fuelType} running keeps daily use and weekend trips straightforward.`,
    vehicle.transmission === "Automatic"
      ? "Automatic transmission is easier in traffic and everyday driving."
      : `${vehicle.transmission} transmission suits buyers who prefer direct control.`,
    vehicle.driveType && /awd|4wd|4x4/i.test(vehicle.driveType)
      ? `${vehicle.driveType} setup adds confidence on mixed road surfaces.`
      : vehicle.bodyType && /suv|pickup/i.test(vehicle.bodyType)
        ? `${vehicle.bodyType} shape gives space and road presence many buyers want.`
        : "Trade-in and viewing support can be confirmed before a physical visit.",
  ];
}

function buildKeyFeatures(vehicle: VehicleRecord) {
  const haystack = `${vehicle.title} ${vehicle.description}`.toLowerCase();
  const featureCatalog = [
    { label: "Reverse Camera", keywords: ["reverse camera", "rear camera", "backup camera"] },
    { label: "Sunroof", keywords: ["sunroof", "moonroof"] },
    { label: "Leather Seats", keywords: ["leather seats", "leather interior"] },
    { label: "Alloy Wheels", keywords: ["alloy wheels"] },
    { label: "Bluetooth", keywords: ["bluetooth"] },
    { label: "Navigation", keywords: ["navigation", "gps"] },
    { label: "Parking Sensors", keywords: ["parking sensors", "park sensors"] },
    { label: "Push Start", keywords: ["push start", "keyless start", "smart key"] },
    { label: "Air Conditioning", keywords: ["air conditioning", "a/c", "ac"] },
    { label: "ABS Brakes", keywords: ["abs brakes", "abs"] },
    { label: "Airbags", keywords: ["airbags", "air bags"] },
    { label: "Entertainment System", keywords: ["entertainment system", "infotainment"] },
  ] as const;

  const features: string[] = [];

  for (const item of featureCatalog) {
    if (item.keywords.some((keyword) => haystack.includes(keyword))) {
      features.push(item.label);
    }
  }

  const fallback = [
    vehicle.transmission ? `${vehicle.transmission} Transmission` : null,
    vehicle.fuelType ? `${vehicle.fuelType} Engine` : null,
    vehicle.driveType ? `${vehicle.driveType} Drive` : null,
    vehicle.engineCapacity ? `${vehicle.engineCapacity} Engine` : null,
    vehicle.bodyType ? `${vehicle.bodyType} Body` : null,
    "Ready for Viewing",
  ];

  for (const item of fallback) {
    if (item && !features.includes(item)) {
      features.push(item);
    }
  }

  return features.slice(0, 8);
}

function buildSpecificationRows(vehicle: VehicleRecord): DetailRow[] {
  return [
    { label: "Model Year", value: String(vehicle.year) },
    {
      label: "Mileage",
      value: vehicle.mileage > 0 ? formatMileage(vehicle.mileage) : "On request",
    },
    {
      label: "Engine Capacity",
      value: vehicle.engineCapacity || "On request",
    },
    { label: "Fuel Type", value: vehicle.fuelType },
    { label: "Transmission", value: vehicle.transmission },
    { label: "Drive Type", value: vehicle.driveType || "On request" },
    { label: "Body Type", value: vehicle.bodyType || "On request" },
    { label: "Exterior Color", value: vehicle.color || "On request" },
  ];
}

function buildConfidenceRows(vehicle: VehicleRecord): DetailRow[] {
  const listingType =
    vehicle.stockCategory === "traded_in"
      ? "Trade-in unit"
      : vehicle.stockCategory === "available_for_importation" || vehicle.stockCategory === "imported"
        ? "Imported vehicle"
        : "Local listing";

  return [
    { label: "Registration status", value: vehicle.condition || "Shared before viewing" },
    { label: "Listing type", value: listingType },
    {
      label: "Viewing location",
      value: vehicle.location?.name || "Mombasa showroom",
    },
    { label: "Paperwork support", value: "Guidance before you visit" },
    { label: "Inspection", value: "Pre-purchase inspection welcome" },
    { label: "Trade-in", value: "Accepted" },
  ];
}

function buildReassuranceItems() {
  return [
    {
      title: "Verified listings",
      description: "Key facts and pricing shown clearly before you enquire.",
    },
    {
      title: "Fast response",
      description: "WhatsApp and calls are handled daily during working hours.",
    },
    {
      title: "Paperwork support",
      description: "Ask about logbook checks, transfer questions, and what to bring before you visit.",
    },
    {
      title: "Trade-in support",
      description: "Ask about valuing your current car as part of the deal.",
    },
  ];
}

function VehicleHeroFactGrid({ facts }: { facts: HeroFact[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {facts.map((fact) => {
        const Icon = fact.icon;

        return (
          <div
            key={fact.label}
            className="rounded-[18px] bg-surface-elevated/78 px-3.5 py-3"
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/8 text-accent">
                <Icon className="size-4.5" />
              </span>
              <div className="min-w-0">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  {fact.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-text-primary">
                  {fact.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VehicleOverviewCard({
  heading,
  summary,
  details,
  highlights,
  features,
  rows,
}: {
  heading: string;
  summary: string;
  details: string;
  highlights: string[];
  features: string[];
  rows: DetailRow[];
}) {
  return (
    <Card className="rounded-[30px] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] lg:p-7">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-text-secondary">
            Vehicle overview
          </p>
          <h2 className="mt-2 text-[1.45rem] font-semibold leading-tight tracking-[-0.04em] text-text-primary">
            {heading}
          </h2>
          <p className="mt-4 max-w-3xl text-[0.98rem] leading-7 text-text-secondary">{summary}</p>

          {details ? (
            <details className="mt-4 group">
              <summary className="cursor-pointer text-sm font-semibold text-accent marker:hidden list-none">
                More description
              </summary>
              <p className="mt-3 text-sm leading-7 text-text-secondary">{details}</p>
            </details>
          ) : null}

          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-text-primary">
                <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-text-secondary">
            Key features
          </p>
          <ul className="mt-4 grid gap-x-5 gap-y-3 sm:grid-cols-2 xl:grid-cols-1">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm font-medium text-text-primary">
                <CheckCircle2 className="size-4.5 shrink-0 text-accent" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 bg-surface-elevated/55 px-4 py-5 sm:rounded-[22px] sm:px-5">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-text-secondary">
          Specifications
        </p>

        <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
          {rows.map((row) => (
            <div key={row.label} className="border-b border-border/40 pb-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
                {row.label}
              </dt>
              <dd className="mt-2 text-sm font-semibold text-text-primary">{row.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 text-xs text-text-secondary">
          Vehicle details are shared in good faith and confirmed during viewing.
        </p>
      </div>
    </Card>
  );
}

function VehicleSupportPanel({
  averageRating,
  confidenceRows,
  askHref,
  mapUrl,
  reviewCount,
  shareUrl,
  title,
  tradeInHref,
  viewingHref,
}: {
  averageRating: string | null;
  confidenceRows: DetailRow[];
  askHref: string;
  mapUrl?: string | null;
  reviewCount: number;
  shareUrl: string;
  title: string;
  tradeInHref: string;
  viewingHref: string;
}) {
  const actionClassName =
    "flex w-full items-center justify-between gap-3 rounded-[18px] bg-surface px-4 py-3 text-left text-sm font-semibold text-text-primary shadow-[0_10px_22px_rgba(15,23,42,0.03)] transition-colors hover:bg-surface-elevated";

  return (
    <Card className="rounded-[30px] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(247,249,251,0.96))] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.05)] lg:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-text-secondary">
            Buyer confidence
          </p>
          <h2 className="mt-2 text-[1.2rem] font-semibold tracking-[-0.04em] text-text-primary">
            What you can confirm before you visit
          </h2>
        </div>

        {averageRating ? (
          <div className="rounded-[18px] bg-white px-4 py-3 text-right shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Trusted by buyers
            </p>
            <div className="mt-1.5 flex items-center justify-end gap-2">
              <span className="text-lg font-semibold tracking-[-0.04em] text-text-primary">
                {averageRating}/5
              </span>
              <div className="flex items-center gap-1 text-accent">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-4 fill-current" />
                ))}
              </div>
            </div>
            <p className="mt-1 text-xs text-text-secondary">
              Based on {reviewCount} featured review{reviewCount === 1 ? "" : "s"}.
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 rounded-[24px] bg-white/92 px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5">
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
          {confidenceRows.map((row) => (
            <div key={row.label} className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/8 text-accent">
                <ShieldCheck className="size-4.5" />
              </span>
              <div className="min-w-0">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  {row.label}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-text-primary">{row.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </Card>
  );
}

function ReassuranceBand() {
  const items = buildReassuranceItems();

  return (
    <section className="rounded-[24px] bg-[linear-gradient(180deg,_rgba(255,255,255,0.94),_rgba(247,249,251,0.88))] px-5 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.04)] lg:px-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/8 text-accent">
              <ShieldCheck className="size-4.5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) {
    return buildMetadata({
      title: "Vehicle not found",
      description: "The requested vehicle is not available.",
      path: `/cars/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${vehicle.year} ${vehicle.make} ${vehicle.model} for Sale in ${vehicle.location?.city || "Mombasa"}`,
    description: vehicle.description,
    path: `/cars/${vehicle.slug}`,
    image: vehicle.heroImageUrl,
  });
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) {
    notFound();
  }

  const [similarVehicles, reviews] = await Promise.all([
    getSimilarVehicles(vehicle, 3),
    getReviews(),
  ]);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Inventory", path: "/inventory" },
    { name: vehicle.title, path: `/cars/${vehicle.slug}` },
  ]);
  const vehicleJsonLd = buildVehicleJsonLd(vehicle);
  const vehiclePath = `/cars/${vehicle.slug}`;
  const whatsappUrl = buildWhatsAppUrl(
    `Hi, I would like to enquire about ${vehicle.title}.`,
    siteConfig.whatsappNumber,
  );
  const shareUrl = absoluteUrl(vehiclePath);
  const descriptionCopy = buildDescriptionCopy(vehicle.description);
  const aboutHighlights = buildAboutHighlights(vehicle);
  const heroFacts = buildHeroFacts(vehicle);
  const detailBadges = buildStatusBadges(vehicle);
  const keyFeatures = buildKeyFeatures(vehicle);
  const specificationRows = buildSpecificationRows(vehicle);
  const confidenceRows = buildConfidenceRows(vehicle);
  const heroTrustLine = buildHeroTrustLine(vehicle);
  const standoutHeading = buildStandoutHeading(vehicle);
  const vehicleSummary = buildVehicleSummary(vehicle);
  const extendedDescription = [descriptionCopy.preview, descriptionCopy.remainder]
    .filter(Boolean)
    .join(" ");
  const averageRating = reviews.length
    ? (reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={vehicleJsonLd} />

      <main className="section-shell pb-24 pt-6 sm:pt-8">
        <div className="container-shell space-y-6 lg:space-y-8">
          <nav aria-label="Breadcrumb" className="text-sm">
            <ol className="flex flex-wrap items-center gap-2 text-[0.82rem] text-text-secondary">
              <li>
                <Link href="/" className="transition-colors hover:text-accent">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/inventory" className="transition-colors hover:text-accent">
                  Inventory
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li
                aria-current="page"
                className="max-w-[20rem] truncate font-semibold text-text-primary"
              >
                {vehicle.title}
              </li>
            </ol>
          </nav>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_390px] xl:items-start">
            <div className="min-w-0">
              <VehicleGallery
                key={vehicle.id}
                images={vehicle.images}
                heroImageUrl={vehicle.heroImageUrl}
                title={vehicle.title}
                compact
              />
            </div>

            <Card className="rounded-[30px] bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] xl:sticky xl:top-24 lg:p-6">
              <div className="flex flex-wrap gap-2">
                {detailBadges.map((badge) => (
                  <Badge key={badge.label} variant={badge.variant}>
                    {badge.label}
                  </Badge>
                ))}
              </div>

              <div className="mt-5">
                <h1 className="max-w-[12ch] text-balance text-[clamp(2.2rem,4vw,3.45rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-text-primary">
                  {vehicle.title}
                </h1>
                <p className="mt-3 text-[clamp(2rem,3vw,2.85rem)] font-semibold leading-none tracking-[-0.05em] text-accent">
                  {formatCurrency(vehicle.price)}
                </p>
              </div>

              <div className="mt-5">
                <VehicleHeroFactGrid facts={heroFacts} />
              </div>

              <p className="mt-4 text-sm font-medium text-text-primary">
                Ask for price confirmation, viewing, or a quick walk-around video.
              </p>
              <div className="mt-5 space-y-3">
                <Button asChild variant="whatsapp" className="w-full rounded-[18px]">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">
                    Inquire on WhatsApp
                  </a>
                </Button>
                <Button asChild variant="secondary" className="w-full rounded-[18px]">
                  <a href={siteConfig.phoneHref}>Call: {siteConfig.phoneDisplay}</a>
                </Button>
                <Button asChild variant="secondary" className="w-full rounded-[18px]">
                  <Link href={`${vehiclePath}?intent=viewing#contact-panel`}>
                    Schedule a Viewing
                  </Link>
                </Button>
              </div>

              <p className="mt-4 text-sm font-medium text-text-secondary">
                {heroTrustLine.join(" • ")}
              </p>
            </Card>
          </section>

          <section>
            <VehicleOverviewCard
              heading={standoutHeading}
              summary={vehicleSummary}
              details={extendedDescription}
              highlights={aboutHighlights}
              features={keyFeatures}
              rows={specificationRows}
            />
          </section>

          <section>
            <VehicleSupportPanel
              averageRating={averageRating}
              confidenceRows={confidenceRows}
              askHref={`${vehiclePath}#contact-panel`}
              shareUrl={shareUrl}
              title={vehicle.title}
              tradeInHref={`/trade-in?vehicle=${vehicle.slug}`}
              viewingHref={`${vehiclePath}?intent=viewing#contact-panel`}
              mapUrl={vehicle.location?.mapUrl}
              reviewCount={reviews.length}
            />
          </section>

          <section id="contact-panel" className="space-y-4">
            <VehicleEnquiryForm
              vehicleId={vehicle.id}
              vehicleTitle={vehicle.title}
              source="Vehicle detail page"
              phoneHref={siteConfig.phoneHref}
              phoneDisplay={siteConfig.phoneDisplay}
              whatsappUrl={whatsappUrl}
              tradeInHref={`/trade-in?vehicle=${vehicle.slug}`}
              compact
              allowedIntents={["quote", "viewing"]}
              eyebrow="Sales help"
              heading="Ask about price, availability, or viewing"
              description="WhatsApp is fastest, but you can also call or send one short message to confirm viewing time, paperwork support, or your trade-in options."
            />
          </section>

          {similarVehicles.length ? (
            <section className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Similar vehicles
                  </p>
                  <h2 className="mt-2 text-[1.55rem] font-semibold leading-tight tracking-[-0.04em] text-text-primary">
                    You may also like
                  </h2>
                </div>
                <Link
                  href="/inventory"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition-colors hover:text-accent"
                >
                  View all similar vehicles
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {similarVehicles.map((item) => (
                  <VehicleCard key={item.id} vehicle={item} variant="related" />
                ))}
              </div>
            </section>
          ) : null}

          <ReassuranceBand />
        </div>
      </main>

      <MobileCtaBar
        whatsappUrl={whatsappUrl}
        phoneHref={siteConfig.phoneHref}
        primaryHref={`${vehiclePath}?intent=viewing#contact-panel`}
        primaryLabel="Viewing"
      />
    </>
  );
}
