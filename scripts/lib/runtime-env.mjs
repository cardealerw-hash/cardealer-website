function readEnv(candidates) {
  for (const key of candidates) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

export function loadServerSyncEnv() {
  const env = {
    cloudinaryCloudName: readEnv(["CLOUDINARY_CLOUD_NAME"]),
    cloudinaryApiKey: readEnv(["CLOUDINARY_API_KEY"]),
    cloudinaryApiSecret: readEnv(["CLOUDINARY_API_SECRET"]),
    supabaseUrl: readEnv(["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"]),
    supabaseSecretKey: readEnv([
      "SUPABASE_SECRET_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
    ]),
  };

  const missing = [
    !env.cloudinaryCloudName ? "CLOUDINARY_CLOUD_NAME" : null,
    !env.cloudinaryApiKey ? "CLOUDINARY_API_KEY" : null,
    !env.cloudinaryApiSecret ? "CLOUDINARY_API_SECRET" : null,
    !env.supabaseUrl
      ? "SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL"
      : null,
    !env.supabaseSecretKey
      ? "SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY"
      : null,
  ].filter(Boolean);

  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}.`,
    );
  }

  return env;
}
