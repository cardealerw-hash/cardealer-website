alter table public.vehicles
add column if not exists stock_code text;

with numbered_vehicles as (
  select
    id,
    'KDL-' || lpad(row_number() over (order by created_at, id)::text, 3, '0') as generated_stock_code
  from public.vehicles
  where stock_code is null
)
update public.vehicles
set stock_code = numbered_vehicles.generated_stock_code
from numbered_vehicles
where public.vehicles.id = numbered_vehicles.id;

alter table public.vehicles
alter column stock_code set not null;

create unique index if not exists vehicles_stock_code_key
on public.vehicles (stock_code);

create unique index if not exists vehicle_images_vehicle_public_id_key
on public.vehicle_images (vehicle_id, cloudinary_public_id)
where cloudinary_public_id is not null;
