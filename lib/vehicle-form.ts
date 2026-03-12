import { vehicleFormSchema } from "@/lib/validation/vehicle";
import {
  asOptionalNumber,
  asOptionalString,
  isTruthy,
  normalizeStockCode,
  slugify,
} from "@/lib/utils";
import type { VehicleFormInput, VehicleImageInput } from "@/types/dealership";

function isBlobUrl(value: unknown) {
  return typeof value === "string" && /^blob:/i.test(value.trim());
}

function resolveUploadState(image: VehicleImageInput) {
  if (image.uploadState) {
    return image.uploadState;
  }

  if (image.sourceUrl) {
    return "pending_url" as const;
  }

  if (
    image.pendingFileId ||
    typeof image.pendingFileOrder === "number" ||
    isBlobUrl(image.imageUrl)
  ) {
    return "pending_file" as const;
  }

  return "uploaded" as const;
}

function parseImages(value: string | undefined): VehicleImageInput[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as VehicleImageInput[];
    return parsed.map((image, index) => ({
      ...image,
      sortOrder: image.sortOrder ?? index,
      isHero: Boolean(image.isHero),
      uploadState: resolveUploadState(image),
      sourceUrl: image.sourceUrl || undefined,
      pendingFileId: image.pendingFileId || undefined,
      pendingFileOrder:
        typeof image.pendingFileOrder === "number"
          ? image.pendingFileOrder
          : undefined,
    }));
  } catch {
    return [];
  }
}

function buildStockCodeTokens(value: string, maxTokens: number) {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .map((token) => token.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, maxTokens)
    .map((token) => token.slice(0, 3));
}

function buildDerivedStockCode({
  year,
  make,
  model,
}: {
  year: number;
  make: string;
  model: string;
}) {
  return normalizeStockCode(
    [
      year > 0 ? String(year) : "",
      ...buildStockCodeTokens(make, 1),
      ...buildStockCodeTokens(model, 2),
    ]
      .filter(Boolean)
      .join("-"),
  ).slice(0, 24);
}

export function mapVehicleFormData(formData: FormData): VehicleFormInput {
  const title = asOptionalString(formData.get("title")) || "";
  const make = asOptionalString(formData.get("make")) || "";
  const model = asOptionalString(formData.get("model")) || "";
  const year = asOptionalNumber(formData.get("year")) || 0;
  const derivedStockCode =
    buildDerivedStockCode({ year, make, model }) ||
    normalizeStockCode(title) ||
    "AUTO-STOCK";

  const payload = {
    id: asOptionalString(formData.get("id")),
    title,
    stockCode: derivedStockCode,
    slug: slugify(title) || undefined,
    make,
    model,
    year,
    condition: asOptionalString(formData.get("condition")) || "",
    price: asOptionalNumber(formData.get("price")) || 0,
    negotiable: isTruthy(formData.get("negotiable")),
    mileage: asOptionalNumber(formData.get("mileage")) || 0,
    transmission: asOptionalString(formData.get("transmission")) || "",
    fuelType: asOptionalString(formData.get("fuelType")) || "",
    driveType: asOptionalString(formData.get("driveType")),
    bodyType: asOptionalString(formData.get("bodyType")),
    engineCapacity: asOptionalString(formData.get("engineCapacity")),
    color: asOptionalString(formData.get("color")),
    locationId: asOptionalString(formData.get("locationId")),
    featured: isTruthy(formData.get("featured")),
    status: asOptionalString(formData.get("status")) || "draft",
    stockCategory:
      asOptionalString(formData.get("stockCategory")) || "used",
    description: asOptionalString(formData.get("description")) || "",
    images: parseImages(asOptionalString(formData.get("imagesJson"))),
  };

  return vehicleFormSchema.parse(payload);
}
