import { createClient } from "@supabase/supabase-js";

function createSupabaseError(message, error) {
  const detail =
    error && typeof error === "object" && "message" in error
      ? String(error.message)
      : String(error || "Unknown Supabase error.");

  return new Error(`${message} ${detail}`.trim());
}

export function createSupabaseAdminClient(config) {
  return createClient(config.supabaseUrl, config.supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function getVehicleByStockCode(supabase, stockCode) {
  const { data, error } = await supabase
    .from("vehicles")
    .select("id, title, stock_code, hero_image_url")
    .eq("stock_code", stockCode)
    .maybeSingle();

  if (error) {
    throw createSupabaseError(
      `Failed to fetch vehicle "${stockCode}".`,
      error,
    );
  }

  if (!data) {
    throw new Error(`No vehicle found for stock code "${stockCode}".`);
  }

  return data;
}

export async function listVehicleImages(supabase, vehicleId) {
  const { data, error } = await supabase
    .from("vehicle_images")
    .select("id, cloudinary_public_id")
    .eq("vehicle_id", vehicleId);

  if (error) {
    throw createSupabaseError(
      `Failed to fetch existing images for vehicle "${vehicleId}".`,
      error,
    );
  }

  return data || [];
}

export async function upsertVehicleImages(supabase, rows) {
  const { data, error } = await supabase
    .from("vehicle_images")
    .upsert(rows, {
      onConflict: "vehicle_id,cloudinary_public_id",
    })
    .select("id, cloudinary_public_id");

  if (error) {
    throw createSupabaseError(
      "Failed to upsert vehicle_images rows. Run the latest Supabase migrations before syncing.",
      error,
    );
  }

  return data || [];
}

export async function deleteVehicleImagesByIds(supabase, ids) {
  if (!ids.length) {
    return 0;
  }

  const { error } = await supabase.from("vehicle_images").delete().in("id", ids);

  if (error) {
    throw createSupabaseError("Failed to delete stale vehicle_images rows.", error);
  }

  return ids.length;
}

export async function updateVehicleHeroImage(supabase, vehicleId, heroImageUrl) {
  const { error } = await supabase
    .from("vehicles")
    .update({
      hero_image_url: heroImageUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vehicleId);

  if (error) {
    throw createSupabaseError(
      `Failed to update hero image for vehicle "${vehicleId}".`,
      error,
    );
  }
}
