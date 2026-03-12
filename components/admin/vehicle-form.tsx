"use client";

import Image from "next/image";
import { ArrowUp, ImagePlus, Star, Trash2 } from "lucide-react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";

import { saveVehicleAction } from "@/lib/actions/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState, Location, Vehicle } from "@/types/dealership";

type EditableImage = {
  imageUrl: string;
  altText?: string | null;
  cloudinaryPublicId?: string | null;
  sortOrder: number;
  isHero: boolean;
  uploadState?: "uploaded" | "pending_file" | "pending_url";
  sourceUrl?: string | null;
  pendingFileId?: string | null;
  pendingFileOrder?: number | null;
};

type PendingFile = {
  id: string;
  file: File;
  previewUrl: string;
};

const initialState: ActionState = { success: false, message: "" };
const selectClassName =
  "h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm text-stone-900";

const conditionOptions = [
  "Foreign used",
  "Locally used",
  "Brand new",
  "Trade-in unit",
];

const transmissionOptions = ["Automatic", "Manual", "CVT"];
const fuelTypeOptions = ["Petrol", "Diesel", "Hybrid", "Electric"];
const driveTypeOptions = ["2WD", "4WD", "AWD", "RWD", "FWD"];
const bodyTypeOptions = ["SUV", "Sedan", "Pickup", "Hatchback", "Van", "Coupe"];

function makeEditableImages(vehicle?: Vehicle | null): EditableImage[] {
  if (!vehicle) {
    return [];
  }

  return vehicle.images.map((image) => ({
    imageUrl: image.imageUrl,
    altText: image.altText,
    cloudinaryPublicId: image.cloudinaryPublicId,
    sortOrder: image.sortOrder,
    isHero: image.isHero,
    uploadState: "uploaded",
    sourceUrl: null,
    pendingFileId: null,
    pendingFileOrder: null,
  }));
}

function getImageLabel(imageUrl: string, fallbackIndex: number) {
  try {
    const pathname = new URL(imageUrl).pathname;
    const filename = pathname.split("/").pop();

    return filename || `Image ${fallbackIndex + 1}`;
  } catch {
    return `Image ${fallbackIndex + 1}`;
  }
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border-t border-border/70 pt-6 first:border-t-0 first:pt-0">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-stone-950">{title}</h3>
        <p className="text-sm text-stone-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function VehicleForm({
  locations,
  vehicle,
}: {
  locations: Location[];
  vehicle?: Vehicle | null;
}) {
  const [state, formAction] = useActionState(saveVehicleAction, initialState);
  const [images, setImages] = useState<EditableImage[]>(() =>
    makeEditableImages(vehicle),
  );
  const [uploadError, setUploadError] = useState("");
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [title, setTitle] = useState(vehicle?.title || "");
  const [make, setMake] = useState(vehicle?.make || "");
  const [model, setModel] = useState(vehicle?.model || "");
  const [year, setYear] = useState(vehicle?.year ? String(vehicle.year) : "");
  const filePickerRef = useRef<HTMLInputElement>(null);
  const stagedFilesInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const pendingFilesRef = useRef<PendingFile[]>([]);

  const serializedImages = useMemo(() => JSON.stringify(images), [images]);

  function normalizeImages(nextImages: EditableImage[]) {
    let pendingFileOrder = 0;
    const heroIndex = nextImages.findIndex((image) => image.isHero);
    const resolvedHeroIndex =
      heroIndex >= 0 ? heroIndex : nextImages.length ? 0 : -1;

    return nextImages.map((image, index) => {
      const normalizedImage: EditableImage = {
        ...image,
        sortOrder: index,
        isHero: index === resolvedHeroIndex,
      };

      if (normalizedImage.uploadState === "pending_file") {
        normalizedImage.pendingFileOrder = pendingFileOrder;
        pendingFileOrder += 1;
      } else {
        normalizedImage.pendingFileOrder = null;
      }

      if (!normalizedImage.uploadState) {
        normalizedImage.uploadState = normalizedImage.cloudinaryPublicId
          ? "uploaded"
          : normalizedImage.sourceUrl
            ? "pending_url"
            : "uploaded";
      }

      return normalizedImage;
    });
  }

  function syncStagedFiles(
    nextImages: EditableImage[],
    nextPendingFiles: PendingFile[],
  ) {
    if (!stagedFilesInputRef.current || typeof DataTransfer === "undefined") {
      return;
    }

    const transfer = new DataTransfer();
    const pendingFileLookup = new Map(
      nextPendingFiles.map((item) => [item.id, item]),
    );

    nextImages
      .filter(
        (image) => image.uploadState === "pending_file" && image.pendingFileId,
      )
      .forEach((image) => {
        const pendingFile = image.pendingFileId
          ? pendingFileLookup.get(image.pendingFileId)
          : null;

        if (pendingFile) {
          transfer.items.add(pendingFile.file);
        }
      });

    stagedFilesInputRef.current.files = transfer.files;
  }

  useEffect(() => {
    syncStagedFiles(images, pendingFiles);
  }, [images, pendingFiles]);

  useEffect(() => {
    pendingFilesRef.current = pendingFiles;
  }, [pendingFiles]);

  useEffect(() => {
    return () => {
      pendingFilesRef.current.forEach((item) =>
        URL.revokeObjectURL(item.previewUrl),
      );
    };
  }, []);

  function addManualImage() {
    const nextUrl = manualImageUrl.trim();

    if (!nextUrl) {
      return;
    }

    try {
      const parsedUrl = new URL(nextUrl);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Use an http or https image URL.");
      }
    } catch {
      setUploadError("Use a valid image URL before staging it.");
      return;
    }

    setUploadError("");
    setImages((current) =>
      normalizeImages([
        ...current,
        {
          imageUrl: nextUrl,
          sourceUrl: nextUrl,
          sortOrder: current.length,
          isHero: current.length === 0,
          uploadState: "pending_url",
          pendingFileId: null,
          pendingFileOrder: null,
        },
      ]),
    );
    setManualImageUrl("");
  }

  function uploadFiles(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    setUploadError("");

    const nextPendingFiles = Array.from(files).map((file) => {
      const pendingFileId = crypto.randomUUID();

      return {
        id: pendingFileId,
        file,
        previewUrl: URL.createObjectURL(file),
      } satisfies PendingFile;
    });

    setPendingFiles((current) => [...current, ...nextPendingFiles]);
    setImages((current) =>
      normalizeImages([
        ...current,
        ...nextPendingFiles.map((item, index) => ({
          imageUrl: item.previewUrl,
          cloudinaryPublicId: null,
          sortOrder: current.length + index,
          isHero: current.length + index === 0,
          uploadState: "pending_file" as const,
          pendingFileId: item.id,
          pendingFileOrder: null,
          sourceUrl: null,
        })),
      ]),
    );

    if (filePickerRef.current) {
      filePickerRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    setImages((current) => {
      const removedImage = current[index];

      if (
        removedImage?.uploadState === "pending_file" &&
        removedImage.pendingFileId
      ) {
        setPendingFiles((pendingCurrent) => {
          const target = pendingCurrent.find(
            (item) => item.id === removedImage.pendingFileId,
          );

          if (target) {
            URL.revokeObjectURL(target.previewUrl);
          }

          return pendingCurrent.filter(
            (item) => item.id !== removedImage.pendingFileId,
          );
        });
      }

      return normalizeImages(current.filter((_, item) => item !== index));
    });
  }

  function moveImageUp(index: number) {
    if (index === 0) {
      return;
    }

    setImages((current) => {
      const next = [...current];
      const target = next[index];
      next[index] = next[index - 1];
      next[index - 1] = target;
      return normalizeImages(next);
    });
  }

  function setHero(index: number) {
    setImages((current) =>
      normalizeImages(
        current.map((image, item) => ({
          ...image,
          isHero: item === index,
        })),
      ),
    );
  }

  return (
    <Card className="rounded-[28px] p-5 sm:p-6">
      <form action={formAction} className="space-y-7">
        <input type="hidden" name="id" value={vehicle?.id || ""} />
        <input type="hidden" name="imagesJson" value={serializedImages} />
        <input
          ref={stagedFilesInputRef}
          type="file"
          name="pendingFiles"
          multiple
          className="hidden"
        />

        <FormSection
          title="Basics"
          description="Keep the key listing fields fast to fill. The reference code and vehicle URL are managed automatically."
        >
          <div className="grid gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <Label htmlFor="title">Listing title</Label>
              <Input
                id="title"
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="2018 Range Rover Vogue"
              />
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                name="year"
                type="number"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                placeholder="2018"
              />
            </div>
            <div>
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                name="make"
                value={make}
                onChange={(event) => setMake(event.target.value)}
                placeholder="Toyota"
              />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder="Land Cruiser V8"
              />
            </div>
            <div className="rounded-3xl border border-dashed border-border/70 bg-stone-50 px-4 py-3 text-sm text-stone-600 xl:col-span-3">
              The system keeps the stock code and public vehicle URL in sync
              automatically when you save this listing.
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Listing setup"
          description="These fields control how the vehicle appears in admin and on the live site."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                defaultValue={vehicle?.price}
              />
            </div>
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Input
                id="condition"
                name="condition"
                defaultValue={vehicle?.condition}
                list="vehicle-condition-options"
                placeholder="Foreign used"
              />
            </div>
            <div>
              <Label htmlFor="locationId">Location</Label>
              <select
                id="locationId"
                name="locationId"
                defaultValue={vehicle?.locationId || ""}
                className={selectClassName}
              >
                <option value="">Select location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={vehicle?.status || "draft"}
                className={selectClassName}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="sold">Sold</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
            <div>
              <Label htmlFor="stockCategory">Stock category</Label>
              <select
                id="stockCategory"
                name="stockCategory"
                defaultValue={vehicle?.stockCategory || "used"}
                className={selectClassName}
              >
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="imported">Imported</option>
                <option value="available_for_importation">
                  Available for importation
                </option>
                <option value="traded_in">Traded-in</option>
              </select>
            </div>
            <label className="flex items-center gap-3 rounded-2xl border border-border bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={vehicle?.featured}
                className="size-4"
              />
              Featured listing
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-border bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700">
              <input
                type="checkbox"
                name="negotiable"
                defaultChecked={vehicle?.negotiable}
                className="size-4"
              />
              Price negotiable
            </label>
          </div>
        </FormSection>

        <FormSection
          title="Vehicle details"
          description="Use the common options for speed, but keep the fields open for custom entries when needed."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <Label htmlFor="mileage">Mileage</Label>
              <Input
                id="mileage"
                name="mileage"
                type="number"
                defaultValue={vehicle?.mileage}
              />
            </div>
            <div>
              <Label htmlFor="transmission">Transmission</Label>
              <Input
                id="transmission"
                name="transmission"
                defaultValue={vehicle?.transmission}
                list="vehicle-transmission-options"
                placeholder="Automatic"
              />
            </div>
            <div>
              <Label htmlFor="fuelType">Fuel type</Label>
              <Input
                id="fuelType"
                name="fuelType"
                defaultValue={vehicle?.fuelType}
                list="vehicle-fuel-options"
                placeholder="Petrol"
              />
            </div>
            <div>
              <Label htmlFor="driveType">Drive type</Label>
              <Input
                id="driveType"
                name="driveType"
                defaultValue={vehicle?.driveType || ""}
                list="vehicle-drive-options"
                placeholder="4WD"
              />
            </div>
            <div>
              <Label htmlFor="bodyType">Body type</Label>
              <Input
                id="bodyType"
                name="bodyType"
                defaultValue={vehicle?.bodyType || ""}
                list="vehicle-body-options"
                placeholder="SUV"
              />
            </div>
            <div>
              <Label htmlFor="engineCapacity">Engine capacity</Label>
              <Input
                id="engineCapacity"
                name="engineCapacity"
                defaultValue={vehicle?.engineCapacity || ""}
                placeholder="4700cc"
              />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                name="color"
                defaultValue={vehicle?.color || ""}
                placeholder="White"
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Description"
          description="Keep the copy short and sales-led so the website reads cleanly."
        >
          <Textarea
            id="description"
            name="description"
            defaultValue={vehicle?.description}
            className="min-h-32"
            placeholder="Highlight condition, standout features, viewing location, and the strongest reason to enquire."
          />
        </FormSection>

        <FormSection
          title="Gallery"
          description="Stage files or URLs here. They only upload to Cloudinary when you save the vehicle."
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <Label htmlFor="manual-image">Stage image from URL</Label>
              <Input
                id="manual-image"
                value={manualImageUrl}
                onChange={(event) => setManualImageUrl(event.target.value)}
                placeholder="https://..."
              />
            </div>
            <button
              type="button"
              onClick={addManualImage}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-semibold text-stone-700"
            >
              <ImagePlus className="size-4" />
              Stage URL
            </button>
            <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-stone-900 px-5 text-sm font-semibold text-white">
              <ImagePlus className="size-4" />
              Stage Files
              <input
                ref={filePickerRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => uploadFiles(event.target.files)}
              />
            </label>
          </div>

          {uploadError ? (
            <p className="text-sm text-red-600">{uploadError}</p>
          ) : null}

          {images.length ? (
            <div className="grid gap-3">
              {images.map((image, index) => {
                const isPending =
                  image.uploadState === "pending_file" ||
                  image.uploadState === "pending_url";

                return (
                  <div
                    key={`${image.imageUrl}-${index}`}
                    className="grid gap-3 rounded-[24px] border border-border bg-white p-3 md:grid-cols-[112px_minmax(0,1fr)_auto] md:items-center"
                  >
                    <div className="relative h-20 overflow-hidden rounded-2xl bg-stone-100">
                      <Image
                        src={image.imageUrl}
                        alt={image.altText || "Vehicle image"}
                        fill
                        sizes="(max-width: 767px) 100vw, 112px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-stone-900">
                          {getImageLabel(image.imageUrl, index)}
                        </p>
                        {image.isHero ? <Badge variant="accent">Hero</Badge> : null}
                        <Badge variant={isPending ? "muted" : "success"}>
                          {isPending ? "Uploads on save" : "Saved"}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-xs text-stone-500">
                        {image.imageUrl}
                      </p>
                      <Input
                        placeholder="Alt text"
                        value={image.altText || ""}
                        onChange={(event) =>
                          setImages((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, altText: event.target.value }
                                : item,
                            ),
                          )
                        }
                        className="mt-3 h-10"
                      />
                    </div>

                    <div className="flex items-center gap-2 md:justify-end">
                      <button
                        type="button"
                        className="inline-flex size-10 items-center justify-center rounded-full border border-border"
                        onClick={() => setHero(index)}
                        aria-label="Set hero image"
                      >
                        <Star
                          className={`size-4 ${
                            image.isHero
                              ? "fill-primary text-primary"
                              : "text-stone-500"
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        className="inline-flex size-10 items-center justify-center rounded-full border border-border"
                        onClick={() => moveImageUp(index)}
                        aria-label="Move image up"
                      >
                        <ArrowUp className="size-4 text-stone-500" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex size-10 items-center justify-center rounded-full border border-border"
                        onClick={() => removeImage(index)}
                        aria-label="Remove image"
                      >
                        <Trash2 className="size-4 text-stone-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-border bg-stone-50 px-5 py-7 text-sm leading-7 text-stone-600">
              No gallery images yet. You can save the vehicle first, then pull
              the Cloudinary folder later, or stage images now and upload them
              with the save action.
            </div>
          )}
        </FormSection>

        {state.message ? (
          <p
            className={`text-sm ${
              state.success ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {state.message}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-600">
            Save once when the listing copy and gallery are ready.
          </p>
          <SubmitButton className="w-full sm:w-auto">Save Vehicle</SubmitButton>
        </div>

        <datalist id="vehicle-condition-options">
          {conditionOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        <datalist id="vehicle-transmission-options">
          {transmissionOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        <datalist id="vehicle-fuel-options">
          {fuelTypeOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        <datalist id="vehicle-drive-options">
          {driveTypeOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        <datalist id="vehicle-body-options">
          {bodyTypeOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </form>
    </Card>
  );
}
