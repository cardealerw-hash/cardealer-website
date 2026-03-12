import type { Vehicle } from "@/types/dealership";

export function SpecGrid({ vehicle }: { vehicle: Vehicle }) {
  const specs = [
    { label: "Model year", value: vehicle.year },
    { label: "Distance driven", value: `${vehicle.mileage.toLocaleString()} km` },
    { label: "Drive style", value: vehicle.transmission },
    { label: "Fuel", value: vehicle.fuelType },
    { label: "Road setup", value: vehicle.driveType || "Not specified" },
    { label: "Body style", value: vehicle.bodyType || "Not specified" },
    { label: "Power", value: vehicle.engineCapacity || "Not specified" },
    { label: "Exterior colour", value: vehicle.color || "Not specified" },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {specs.map((spec) => (
        <div
          key={spec.label}
          className="rounded-3xl border border-stone-200 bg-stone-50 px-5 py-4"
        >
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-stone-500">
            {spec.label}
          </p>
          <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-stone-950">
            {spec.value}
          </p>
        </div>
      ))}
    </div>
  );
}
