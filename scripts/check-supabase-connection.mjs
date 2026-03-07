import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const shouldWriteTest = process.argv.includes("--write-test");

function fail(message) {
  console.error(`\n[supabase-check] ${message}`);
  process.exitCode = 1;
}

function createSupabase() {
  if (!url || !publishableKey) {
    fail(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in the environment.",
    );
    return null;
  }

  return createClient(url, secretKey || publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function logSuccess(message) {
  console.log(`[supabase-check] ${message}`);
}

async function run() {
  const supabase = createSupabase();
  if (!supabase) {
    return;
  }

  const { data: vehicles, error: listError } = await supabase
    .from("vehicles")
    .select("id,title,status")
    .eq("status", "published")
    .limit(10);

  if (listError) {
    fail(`Test 1 failed: ${listError.message}`);
    return;
  }

  logSuccess(`Test 1 passed: fetched ${vehicles.length} published vehicle(s).`);

  const { data: vehicleWithImages, error: vehicleError } = await supabase
    .from("vehicles")
    .select(
      "id,title,status,vehicle_images(id,image_url,cloudinary_public_id,sort_order,is_hero)",
    )
    .eq("status", "published")
    .limit(1)
    .maybeSingle();

  if (vehicleError) {
    fail(`Test 2 failed: ${vehicleError.message}`);
    return;
  }

  if (vehicleWithImages) {
    logSuccess(
      `Test 2 passed: fetched "${vehicleWithImages.title}" with ${
        vehicleWithImages.vehicle_images?.length || 0
      } related image record(s).`,
    );
  } else {
    logSuccess(
      "Test 2 passed: vehicles and vehicle_images relation are queryable, but there are no published rows yet.",
    );
  }

  if (!shouldWriteTest) {
    console.log(
      "[supabase-check] Test 3 skipped. Run `npm.cmd run supabase:check:write` to verify server-side inserts and cleanup.",
    );
    return;
  }

  if (!secretKey) {
    fail("Test 3 requires SUPABASE_SECRET_KEY for server-side write verification.");
    return;
  }

  const testSlug = `connection-check-${Date.now()}`;
  const testPayload = {
    title: `Connection Check ${new Date().toISOString()}`,
    stock_code: `CHK-${Date.now()}`,
    slug: testSlug,
    make: "Test",
    model: "Probe",
    year: 2026,
    condition: "Diagnostic insert",
    price: 0,
    negotiable: false,
    mileage: 0,
    transmission: "Automatic",
    fuel_type: "Petrol",
    featured: false,
    status: "draft",
    stock_category: "used",
    description: "Temporary row created by the Supabase connection check script.",
  };

  const { data: insertedRow, error: insertError } = await supabase
    .from("vehicles")
    .insert(testPayload)
    .select("id,title")
    .single();

  if (insertError) {
    fail(`Test 3 failed during insert: ${insertError.message}`);
    return;
  }

  const { error: deleteError } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", insertedRow.id);

  if (deleteError) {
    fail(
      `Test 3 inserted "${insertedRow.title}" but cleanup failed: ${deleteError.message}`,
    );
    return;
  }

  logSuccess(`Test 3 passed: inserted and deleted "${insertedRow.title}".`);
}

run().catch((error) => {
  fail(error instanceof Error ? error.message : "Unexpected Supabase check failure.");
});
