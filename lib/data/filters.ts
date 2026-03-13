import { siteConfig } from "@/lib/config/site";
import {
  humanizeStockCategory,
  normalizeStockCode,
  slugify,
  vehicleSearchText,
} from "@/lib/utils";
import type {
  InventoryFacets,
  InventoryQuery,
  InventoryResult,
  Location,
  Vehicle,
  VehicleFormInput,
  VehicleImage,
} from "@/types/dealership";

function createUuid() {
  const randomUuid = globalThis.crypto?.randomUUID?.bind(globalThis.crypto);

  if (!randomUuid) {
    throw new Error("crypto.randomUUID is unavailable in this runtime.");
  }

  return randomUuid();
}

function isUuid(value: string | undefined | null) {
  if (!value) {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function shiftMapValue<T>(map: Map<string, T[]>, key: string) {
  const values = map.get(key);

  if (!values?.length) {
    return undefined;
  }

  const [value, ...rest] = values;

  if (rest.length) {
    map.set(key, rest);
  } else {
    map.delete(key);
  }

  return value;
}

function buildExistingImageLookup(existing: Vehicle | undefined) {
  const byCloudinaryPublicId = new Map<string, VehicleImage[]>();
  const byImageUrl = new Map<string, VehicleImage[]>();

  for (const image of existing?.images || []) {
    if (image.cloudinaryPublicId) {
      const images = byCloudinaryPublicId.get(image.cloudinaryPublicId) || [];
      images.push(image);
      byCloudinaryPublicId.set(image.cloudinaryPublicId, images);
      continue;
    }

    const images = byImageUrl.get(image.imageUrl) || [];
    images.push(image);
    byImageUrl.set(image.imageUrl, images);
  }

  return {
    byCloudinaryPublicId,
    byImageUrl,
  };
}

export function categoryMatches(
  vehicle: Vehicle,
  category?: InventoryQuery["category"],
) {
  if (!category) {
    return true;
  }

  if (category === "imported") {
    return ["imported", "available_for_importation"].includes(
      vehicle.stockCategory,
    );
  }

  if (category === "traded-in") {
    return vehicle.stockCategory === "traded_in";
  }

  return vehicle.stockCategory === category;
}

export function buildFacets(vehicles: Vehicle[]): InventoryFacets {
  const prices = vehicles.map((vehicle) => vehicle.price).filter(Boolean);

  return {
    makes: [...new Set(vehicles.map((vehicle) => vehicle.make))].sort(),
    locations: [
      ...new Set(
        vehicles.map((vehicle) => vehicle.location?.name || vehicle.location?.city),
      ),
    ]
      .filter(Boolean)
      .sort() as string[],
    transmissions: [
      ...new Set(vehicles.map((vehicle) => vehicle.transmission)),
    ].sort(),
    fuelTypes: [...new Set(vehicles.map((vehicle) => vehicle.fuelType))].sort(),
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
  };
}

export function applyInventoryFilters(vehicles: Vehicle[], query: InventoryQuery) {
  const filtered = vehicles.filter((vehicle) => {
    if (vehicle.status !== "published") {
      return false;
    }

    if (query.q && !vehicleSearchText(vehicle).includes(query.q.toLowerCase())) {
      return false;
    }

    if (
      query.make &&
      vehicle.make.toLowerCase() !== query.make.trim().toLowerCase()
    ) {
      return false;
    }

    if (!categoryMatches(vehicle, query.category)) {
      return false;
    }

    if (
      query.location &&
      ![vehicle.location?.name, vehicle.location?.city]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query.location.toLowerCase())
    ) {
      return false;
    }

    if (query.minPrice && vehicle.price < query.minPrice) {
      return false;
    }

    if (query.maxPrice && vehicle.price > query.maxPrice) {
      return false;
    }

    if (query.yearFrom && vehicle.year < query.yearFrom) {
      return false;
    }

    if (query.yearTo && vehicle.year > query.yearTo) {
      return false;
    }

    if (
      query.transmission &&
      vehicle.transmission.toLowerCase() !== query.transmission.toLowerCase()
    ) {
      return false;
    }

    if (
      query.fuelType &&
      vehicle.fuelType.toLowerCase() !== query.fuelType.toLowerCase()
    ) {
      return false;
    }

    return true;
  });

  const sort = query.sort || siteConfig.inventorySearchDefaults.sort;

  filtered.sort((left, right) => {
    switch (sort) {
      case "price-asc":
        return left.price - right.price;
      case "price-desc":
        return right.price - left.price;
      case "year-desc":
        return right.year - left.year;
      case "mileage-asc":
        return left.mileage - right.mileage;
      case "latest":
      default:
        return (
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime()
        );
    }
  });

  return filtered;
}

export function paginateVehicles(items: Vehicle[], query: InventoryQuery): InventoryResult {
  const pageSize = query.pageSize || siteConfig.inventorySearchDefaults.pageSize;
  const page = Math.max(1, query.page || 1);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
    facets: buildFacets(items),
    filters: query,
  };
}

function buildUniqueValue(
  baseValue: string,
  usedValues: Set<string>,
  normalizeValue: (value: string) => string,
) {
  const normalizedBaseValue = normalizeValue(baseValue);

  if (!normalizedBaseValue || !usedValues.has(normalizedBaseValue)) {
    return normalizedBaseValue;
  }

  let suffix = 2;

  while (true) {
    const candidate = normalizeValue(`${normalizedBaseValue}-${suffix}`);

    if (!usedValues.has(candidate)) {
      return candidate;
    }

    suffix += 1;
  }
}

export function resolveVehicleIdentifiers(
  input: Pick<VehicleFormInput, "id" | "title" | "stockCode" | "slug">,
  vehicles: Pick<Vehicle, "id" | "stockCode" | "slug">[],
) {
  const otherVehicles = vehicles.filter((vehicle) => vehicle.id !== input.id);
  const usedStockCodes = new Set(
    otherVehicles.map((vehicle) => normalizeStockCode(vehicle.stockCode)),
  );
  const usedSlugs = new Set(otherVehicles.map((vehicle) => slugify(vehicle.slug)));

  return {
    stockCode: buildUniqueValue(
      input.stockCode,
      usedStockCodes,
      normalizeStockCode,
    ),
    slug: buildUniqueValue(input.slug || input.title, usedSlugs, slugify),
  };
}

export function createVehicleFromInput(
  input: VehicleFormInput,
  existing: Vehicle | undefined,
  locations: Location[],
) {
  const id = input.id || createUuid();
  const timestamp = new Date().toISOString();
  const location = locations.find((item) => item.id === input.locationId) || null;
  const existingImageLookup = buildExistingImageLookup(existing);
  const images: VehicleImage[] = input.images.map((image, index) => {
    const matchedImage = image.cloudinaryPublicId
      ? shiftMapValue(
          existingImageLookup.byCloudinaryPublicId,
          image.cloudinaryPublicId,
        )
      : shiftMapValue(existingImageLookup.byImageUrl, image.imageUrl);
    const persistedMatchedImage =
      matchedImage && isUuid(matchedImage.id) ? matchedImage : null;

    return {
      id: persistedMatchedImage?.id || createUuid(),
      vehicleId: id,
      imageUrl: image.imageUrl,
      altText:
        image.altText ||
        `${input.title} ${index === 0 ? "hero view" : `view ${index + 1}`}`,
      cloudinaryPublicId: image.cloudinaryPublicId || null,
      sortOrder: image.sortOrder,
      isHero: image.isHero,
      createdAt: persistedMatchedImage?.createdAt || timestamp,
    };
  });

  const heroImage = images.find((image) => image.isHero) || images[0];

  return {
    id,
    title: input.title,
    stockCode: input.stockCode,
    slug: input.slug || slugify(input.title),
    make: input.make,
    model: input.model,
    year: input.year,
    condition: input.condition,
    price: input.price,
    negotiable: input.negotiable,
    mileage: input.mileage,
    transmission: input.transmission,
    fuelType: input.fuelType,
    driveType: input.driveType || null,
    bodyType: input.bodyType || null,
    engineCapacity: input.engineCapacity || null,
    color: input.color || null,
    locationId: input.locationId || null,
    location,
    featured: input.featured,
    status: input.status,
    stockCategory: input.stockCategory,
    description: input.description,
    heroImageUrl: heroImage?.imageUrl || null,
    images,
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
  } satisfies Vehicle;
}

export function getCategorySummary(vehicle: Vehicle) {
  return humanizeStockCategory(vehicle.stockCategory);
}
