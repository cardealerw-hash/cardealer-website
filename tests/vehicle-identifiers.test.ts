import { describe, expect, it } from "vitest";

import {
  createVehicleFromInput,
  resolveVehicleIdentifiers,
} from "@/lib/data/filters";

describe("resolveVehicleIdentifiers", () => {
  it("keeps the current vehicle identifiers when editing the same record", () => {
    const result = resolveVehicleIdentifiers(
      {
        id: "vehicle-1",
        title: "2020 Toyota Prado",
        stockCode: "2020-TOY-PRA",
        slug: "2020-toyota-prado",
      },
      [
        {
          id: "vehicle-1",
          stockCode: "2020-TOY-PRA",
          slug: "2020-toyota-prado",
        },
        {
          id: "vehicle-2",
          stockCode: "2021-TOY-HIL",
          slug: "2021-toyota-hilux",
        },
      ],
    );

    expect(result).toEqual({
      stockCode: "2020-TOY-PRA",
      slug: "2020-toyota-prado",
    });
  });

  it("appends numeric suffixes when another vehicle already uses the same identifiers", () => {
    const result = resolveVehicleIdentifiers(
      {
        title: "2020 Toyota Prado",
        stockCode: "2020-TOY-PRA",
        slug: "2020-toyota-prado",
      },
      [
        {
          id: "vehicle-1",
          stockCode: "2020-TOY-PRA",
          slug: "2020-toyota-prado",
        },
        {
          id: "vehicle-2",
          stockCode: "2020-TOY-PRA-2",
          slug: "2020-toyota-prado-2",
        },
      ],
    );

    expect(result).toEqual({
      stockCode: "2020-TOY-PRA-3",
      slug: "2020-toyota-prado-3",
    });
  });
});

describe("createVehicleFromInput", () => {
  it("generates UUID-compatible ids for new database-backed vehicles and images", () => {
    const result = createVehicleFromInput(
      {
        title: "2020 Toyota Prado",
        stockCode: "2020-TOY-PRA",
        slug: "2020-toyota-prado",
        make: "Toyota",
        model: "Prado",
        year: 2020,
        condition: "Foreign used",
        price: 6500000,
        negotiable: false,
        mileage: 42000,
        transmission: "Automatic",
        fuelType: "Diesel",
        driveType: null,
        bodyType: null,
        engineCapacity: null,
        color: null,
        locationId: null,
        featured: false,
        status: "draft",
        stockCategory: "used",
        description: "A clean SUV with strong condition notes and ready availability.",
        images: [
          {
            imageUrl: "https://cdn.example.com/prado-1.jpg",
            cloudinaryPublicId: "prado-1",
            sortOrder: 0,
            isHero: true,
            uploadState: "uploaded",
          },
        ],
      },
      undefined,
      [],
    );

    expect(result.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(result.images[0].id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(result.images[0].vehicleId).toBe(result.id);
  });

  it("preserves existing image UUIDs when only hero metadata changes", () => {
    const existingVehicle = {
      id: "416a2a8d-bc6d-406c-b00c-d53a8334c8ec",
      title: "2020 Toyota Prado",
      stockCode: "2020-TOY-PRA",
      slug: "2020-toyota-prado",
      make: "Toyota",
      model: "Prado",
      year: 2020,
      condition: "Foreign used",
      price: 6500000,
      negotiable: false,
      mileage: 42000,
      transmission: "Automatic",
      fuelType: "Diesel",
      driveType: null,
      bodyType: null,
      engineCapacity: null,
      color: null,
      locationId: null,
      location: null,
      featured: false,
      status: "published" as const,
      stockCategory: "used" as const,
      description: "A clean SUV with strong condition notes and ready availability.",
      heroImageUrl: "https://cdn.example.com/prado-1.jpg",
      images: [
        {
          id: "0ae80d39-4938-45f6-a22f-2c4cfc18fa7a",
          vehicleId: "416a2a8d-bc6d-406c-b00c-d53a8334c8ec",
          imageUrl: "https://cdn.example.com/prado-1.jpg",
          altText: "Front angle",
          cloudinaryPublicId: "prado-1",
          sortOrder: 0,
          isHero: true,
          createdAt: "2026-03-01T10:00:00.000Z",
        },
        {
          id: "21158c32-f0d5-4cd3-94a1-7d3e86681d2e",
          vehicleId: "416a2a8d-bc6d-406c-b00c-d53a8334c8ec",
          imageUrl: "https://cdn.example.com/prado-2.jpg",
          altText: "Rear angle",
          cloudinaryPublicId: "prado-2",
          sortOrder: 1,
          isHero: false,
          createdAt: "2026-03-01T10:05:00.000Z",
        },
      ],
      createdAt: "2026-03-01T09:00:00.000Z",
      updatedAt: "2026-03-01T09:00:00.000Z",
    };

    const result = createVehicleFromInput(
      {
        id: existingVehicle.id,
        title: existingVehicle.title,
        stockCode: existingVehicle.stockCode,
        slug: existingVehicle.slug,
        make: existingVehicle.make,
        model: existingVehicle.model,
        year: existingVehicle.year,
        condition: existingVehicle.condition,
        price: existingVehicle.price,
        negotiable: existingVehicle.negotiable,
        mileage: existingVehicle.mileage,
        transmission: existingVehicle.transmission,
        fuelType: existingVehicle.fuelType,
        driveType: existingVehicle.driveType,
        bodyType: existingVehicle.bodyType,
        engineCapacity: existingVehicle.engineCapacity,
        color: existingVehicle.color,
        locationId: existingVehicle.locationId,
        featured: existingVehicle.featured,
        status: existingVehicle.status,
        stockCategory: existingVehicle.stockCategory,
        description: existingVehicle.description,
        images: [
          {
            imageUrl: "https://cdn.example.com/prado-1.jpg",
            cloudinaryPublicId: "prado-1",
            sortOrder: 0,
            isHero: false,
            uploadState: "uploaded",
          },
          {
            imageUrl: "https://cdn.example.com/prado-2.jpg",
            cloudinaryPublicId: "prado-2",
            sortOrder: 1,
            isHero: true,
            uploadState: "uploaded",
          },
        ],
      },
      existingVehicle,
      [],
    );

    expect(result.id).toBe(existingVehicle.id);
    expect(result.images).toEqual([
      expect.objectContaining({
        id: existingVehicle.images[0].id,
        createdAt: existingVehicle.images[0].createdAt,
        isHero: false,
      }),
      expect.objectContaining({
        id: existingVehicle.images[1].id,
        createdAt: existingVehicle.images[1].createdAt,
        isHero: true,
      }),
    ]);
    expect(result.heroImageUrl).toBe("https://cdn.example.com/prado-2.jpg");
  });

  it("replaces synthetic hydrated image ids with UUIDs before database persistence", () => {
    const existingVehicle = {
      id: "416a2a8d-bc6d-406c-b00c-d53a8334c8ec",
      title: "2020 Toyota Prado",
      stockCode: "2020-TOY-PRA",
      slug: "2020-toyota-prado",
      make: "Toyota",
      model: "Prado",
      year: 2020,
      condition: "Foreign used",
      price: 6500000,
      negotiable: false,
      mileage: 42000,
      transmission: "Automatic",
      fuelType: "Diesel",
      driveType: null,
      bodyType: null,
      engineCapacity: null,
      color: null,
      locationId: null,
      location: null,
      featured: false,
      status: "published" as const,
      stockCategory: "used" as const,
      description: "A clean SUV with strong condition notes and ready availability.",
      heroImageUrl: "https://cdn.example.com/prado-1.jpg",
      images: [
        {
          id: "416a2a8d-bc6d-406c-b00c-d53a8334c8ec-image-1",
          vehicleId: "416a2a8d-bc6d-406c-b00c-d53a8334c8ec",
          imageUrl: "https://cdn.example.com/prado-1.jpg",
          altText: "Front angle",
          cloudinaryPublicId: "prado-1",
          sortOrder: 0,
          isHero: true,
          createdAt: "2026-03-01T10:00:00.000Z",
        },
        {
          id: "416a2a8d-bc6d-406c-b00c-d53a8334c8ec-image-2",
          vehicleId: "416a2a8d-bc6d-406c-b00c-d53a8334c8ec",
          imageUrl: "https://cdn.example.com/prado-2.jpg",
          altText: "Rear angle",
          cloudinaryPublicId: "prado-2",
          sortOrder: 1,
          isHero: false,
          createdAt: "2026-03-01T10:05:00.000Z",
        },
      ],
      createdAt: "2026-03-01T09:00:00.000Z",
      updatedAt: "2026-03-01T09:00:00.000Z",
    };

    const result = createVehicleFromInput(
      {
        id: existingVehicle.id,
        title: existingVehicle.title,
        stockCode: existingVehicle.stockCode,
        slug: existingVehicle.slug,
        make: existingVehicle.make,
        model: existingVehicle.model,
        year: existingVehicle.year,
        condition: existingVehicle.condition,
        price: existingVehicle.price,
        negotiable: existingVehicle.negotiable,
        mileage: existingVehicle.mileage,
        transmission: existingVehicle.transmission,
        fuelType: existingVehicle.fuelType,
        driveType: existingVehicle.driveType,
        bodyType: existingVehicle.bodyType,
        engineCapacity: existingVehicle.engineCapacity,
        color: existingVehicle.color,
        locationId: existingVehicle.locationId,
        featured: existingVehicle.featured,
        status: existingVehicle.status,
        stockCategory: existingVehicle.stockCategory,
        description: existingVehicle.description,
        images: [
          {
            imageUrl: "https://cdn.example.com/prado-1.jpg",
            cloudinaryPublicId: "prado-1",
            sortOrder: 0,
            isHero: false,
            uploadState: "uploaded",
          },
          {
            imageUrl: "https://cdn.example.com/prado-2.jpg",
            cloudinaryPublicId: "prado-2",
            sortOrder: 1,
            isHero: true,
            uploadState: "uploaded",
          },
        ],
      },
      existingVehicle,
      [],
    );

    expect(result.images[0].id).not.toBe(existingVehicle.images[0].id);
    expect(result.images[1].id).not.toBe(existingVehicle.images[1].id);
    expect(result.images[0].id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(result.images[1].id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
