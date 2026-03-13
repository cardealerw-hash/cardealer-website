import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InventoryFacets, InventoryQuery } from "@/types/dealership";

function SelectField({
  name,
  defaultValue,
  options,
  placeholder,
  className = "",
}: {
  name: string;
  defaultValue?: string;
  options: string[];
  placeholder: string;
  className?: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue || ""}
      className={`h-12 w-full appearance-none bg-transparent px-4 py-2 text-[0.85rem] font-medium text-text-primary outline-none transition-colors hover:text-text-primary focus:text-text-primary ${className}`}
    >
      <option value="" className="font-normal text-text-secondary">
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export function InventoryFilterBar({
  actionPath = "/inventory",
  query,
  facets,
}: {
  actionPath?: string;
  query: InventoryQuery;
  facets: InventoryFacets;
}) {
  const hasAdvancedFilters = Boolean(
    query.make ||
      query.location ||
      query.transmission ||
      query.fuelType ||
      (query.sort && query.sort !== "latest"),
  );
  const activeFilterCount = [
    query.make,
    query.location,
    query.transmission,
    query.fuelType,
    query.sort && query.sort !== "latest" ? query.sort : undefined,
  ].filter(Boolean).length;

  return (
    <form
      action={actionPath}
      className="flex flex-col gap-3 rounded-[24px] border border-border bg-surface p-2.5 shadow-[0_10px_28px_rgba(28,35,43,0.05)] lg:flex-row lg:items-center lg:gap-0 lg:rounded-full lg:p-2"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-[1.15rem] -translate-y-1/2 text-text-secondary/70" />
        <Input
          name="q"
          defaultValue={query.q}
          placeholder="Search make, model, or keyword..."
          className="h-12 min-w-[240px] border-0 bg-transparent pl-11 text-[0.85rem] font-medium text-text-primary placeholder:font-normal placeholder:text-text-secondary/70 focus-visible:ring-0"
        />
      </div>

      <details
        open={hasAdvancedFilters}
        className="overflow-hidden rounded-[20px] border border-border bg-surface-elevated lg:hidden"
      >
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-text-primary [&::-webkit-details-marker]:hidden">
          {activeFilterCount
            ? `More filters (${activeFilterCount})`
            : "More filters"}
        </summary>
        <div className="grid border-t border-border">
          <div className="border-t border-border first:border-t-0">
            <SelectField
              name="make"
              defaultValue={query.make}
              options={facets.makes}
              placeholder="Any make"
            />
          </div>
          <div className="border-t border-border">
            <SelectField
              name="location"
              defaultValue={query.location}
              options={facets.locations}
              placeholder="Any location"
            />
          </div>
          <div className="border-t border-border">
            <SelectField
              name="transmission"
              defaultValue={query.transmission}
              options={facets.transmissions}
              placeholder="Transmission"
            />
          </div>
          <div className="border-t border-border">
            <SelectField
              name="fuelType"
              defaultValue={query.fuelType}
              options={facets.fuelTypes}
              placeholder="Fuel Type"
            />
          </div>
          <div className="border-t border-border">
            <SelectField
              name="sort"
              defaultValue={query.sort}
              options={["latest", "price-asc", "price-desc", "year-desc", "mileage-asc"]}
              placeholder="Sort Order"
            />
          </div>
        </div>
      </details>

      <div className="hidden lg:flex lg:flex-row lg:items-center">
        <div className="border-t border-border lg:w-[160px] lg:border-l lg:border-t-0">
          <SelectField
            name="make"
            defaultValue={query.make}
            options={facets.makes}
            placeholder="Any make"
          />
        </div>
        <div className="border-t border-border lg:w-[150px] lg:border-l lg:border-t-0">
          <SelectField
            name="location"
            defaultValue={query.location}
            options={facets.locations}
            placeholder="Any location"
          />
        </div>
        <div className="border-t border-border lg:w-[160px] lg:border-l lg:border-t-0">
          <SelectField
            name="transmission"
            defaultValue={query.transmission}
            options={facets.transmissions}
            placeholder="Transmission"
          />
        </div>
        <div className="border-t border-border lg:w-[140px] lg:border-l lg:border-t-0">
          <SelectField
            name="fuelType"
            defaultValue={query.fuelType}
            options={facets.fuelTypes}
            placeholder="Fuel Type"
          />
        </div>
        <div className="border-t border-border lg:w-[150px] lg:border-l lg:border-t-0 lg:pr-3">
          <SelectField
            name="sort"
            defaultValue={query.sort}
            options={["latest", "price-asc", "price-desc", "year-desc", "mileage-asc"]}
            placeholder="Sort Order"
          />
        </div>
      </div>
      
      <Button
        type="submit"
        className="h-12 rounded-xl px-8 text-sm font-semibold lg:rounded-full"
      >
        Search
      </Button>
    </form>
  );
}
