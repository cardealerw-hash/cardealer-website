import Image from "next/image";
import Link from "next/link";

import {
  deleteVehicleAction,
  setVehicleStatusAction,
  toggleVehicleFeaturedAction,
} from "@/lib/actions/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAdminVehicles } from "@/lib/data/repository";
import {
  formatCurrency,
  formatMileage,
  humanizeStatus,
  humanizeStockCategory,
} from "@/lib/utils";

function getStatusVariant(status: "draft" | "published" | "sold" | "unpublished") {
  if (status === "published") {
    return "success";
  }

  if (status === "sold") {
    return "default";
  }

  return "muted";
}

export default async function AdminVehiclesPage() {
  const vehicles = await getAdminVehicles();

  return (
    <Card className="overflow-hidden rounded-[28px]">
      <div className="flex flex-col gap-4 border-b border-border bg-stone-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-stone-950">Vehicles</h3>
          <p className="mt-1 text-sm text-stone-600">
            Scan the stock quickly, open the right listing, and use the compact
            actions only when you need them.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/vehicles/new">Add Vehicle</Link>
        </Button>
      </div>

      {vehicles.length ? (
        <div className="divide-y divide-border/70">
          {vehicles.map((vehicle) => {
            const previewImage =
              vehicle.heroImageUrl || vehicle.images[0]?.imageUrl || null;

            return (
              <div
                key={vehicle.id}
                className="grid gap-4 px-5 py-4 lg:grid-cols-[96px_minmax(0,1.6fr)_minmax(0,1fr)_auto] lg:items-center"
              >
                <div className="relative h-24 overflow-hidden rounded-[22px] bg-stone-100">
                  {previewImage ? (
                    <Image
                      src={previewImage}
                      alt={vehicle.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="truncate text-base font-semibold text-stone-950">
                      {vehicle.title}
                    </h4>
                    <Badge variant="accent">
                      {humanizeStockCategory(vehicle.stockCategory)}
                    </Badge>
                    {vehicle.featured ? (
                      <Badge variant="muted">Featured</Badge>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-[0.14em] text-stone-500">
                    <span>{vehicle.stockCode}</span>
                    <span>{vehicle.location?.name || "No location"}</span>
                    <span>{vehicle.year}</span>
                    <span>{vehicle.transmission}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-lg font-semibold text-stone-950">
                    {formatCurrency(vehicle.price)}
                  </p>
                  <p className="text-sm text-stone-600">
                    {formatMileage(vehicle.mileage)} / {vehicle.fuelType}
                  </p>
                  <Badge variant={getStatusVariant(vehicle.status)}>
                    {humanizeStatus(vehicle.status)}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <Button asChild size="sm">
                    <Link href={`/admin/vehicles/${vehicle.id}`}>Edit</Link>
                  </Button>

                  <form action={toggleVehicleFeaturedAction}>
                    <input type="hidden" name="id" value={vehicle.id} />
                    <Button size="sm" variant="ghost">
                      {vehicle.featured ? "Unfeature" : "Feature"}
                    </Button>
                  </form>

                  {vehicle.status !== "published" ? (
                    <form action={setVehicleStatusAction}>
                      <input type="hidden" name="id" value={vehicle.id} />
                      <input type="hidden" name="status" value="published" />
                      <Button size="sm" variant="secondary">
                        Publish
                      </Button>
                    </form>
                  ) : (
                    <form action={setVehicleStatusAction}>
                      <input type="hidden" name="id" value={vehicle.id} />
                      <input type="hidden" name="status" value="unpublished" />
                      <Button size="sm" variant="secondary">
                        Unpublish
                      </Button>
                    </form>
                  )}

                  {vehicle.status !== "sold" ? (
                    <form action={setVehicleStatusAction}>
                      <input type="hidden" name="id" value={vehicle.id} />
                      <input type="hidden" name="status" value="sold" />
                      <Button size="sm" variant="ghost">
                        Mark sold
                      </Button>
                    </form>
                  ) : null}

                  <form action={deleteVehicleAction}>
                    <input type="hidden" name="id" value={vehicle.id} />
                    <Button size="sm" variant="ghost">
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-5 py-10 text-sm text-stone-600">
          No vehicles yet. Add the first listing to start building the admin
          stock view.
        </div>
      )}
    </Card>
  );
}
