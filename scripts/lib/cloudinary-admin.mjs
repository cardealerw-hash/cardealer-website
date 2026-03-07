import { v2 as cloudinary } from "cloudinary";

const SUPPORTED_IMAGE_FORMATS = new Set(["jpg", "jpeg", "png", "webp"]);

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isRetryableCloudinaryError(error) {
  const message = error instanceof Error ? error.message : String(error || "");
  const httpCode =
    typeof error === "object" && error !== null && "http_code" in error
      ? Number(error.http_code)
      : undefined;

  return (
    httpCode === 429 ||
    (httpCode !== undefined && httpCode >= 500) ||
    /rate limit|timed out|econnreset|socket hang up/i.test(message)
  );
}

async function withRetries(task, label, maxAttempts = 4) {
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt += 1;

    try {
      return await task();
    } catch (error) {
      if (!isRetryableCloudinaryError(error) || attempt >= maxAttempts) {
        throw error;
      }

      const delay = 500 * 2 ** (attempt - 1);
      console.warn(
        `[cloudinary-sync] ${label} failed on attempt ${attempt}. Retrying in ${delay}ms.`,
      );
      await wait(delay);
    }
  }

  throw new Error(`Unable to complete ${label}.`);
}

function isSupportedImageAsset(resource) {
  const format = String(resource?.format || "").toLowerCase();
  return SUPPORTED_IMAGE_FORMATS.has(format);
}

function extractAssetStem(resource) {
  return String(resource?.public_id || "")
    .split("/")
    .pop() || "";
}

function parseLeadingNumber(value) {
  if (!value) {
    return Number.NaN;
  }

  const match = value.match(/^\d+/);
  return match ? Number(match[0]) : Number.NaN;
}

export function createCloudinaryAdminClient(config) {
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
  });

  return cloudinary;
}

export async function listAssetsByAssetFolder(cloudinaryClient, assetFolder) {
  const resources = [];
  let nextCursor;

  do {
    const result = await withRetries(
      () =>
        cloudinaryClient.api.resources_by_asset_folder(assetFolder, {
          max_results: 500,
          next_cursor: nextCursor,
        }),
      `listing Cloudinary assets for ${assetFolder}`,
    );

    resources.push(...(result.resources || []));
    nextCursor = result.next_cursor;
  } while (nextCursor);

  return resources.filter(isSupportedImageAsset);
}

export function sortCloudinaryAssets(resources) {
  return [...resources].sort((left, right) => {
    const leftStem = extractAssetStem(left);
    const rightStem = extractAssetStem(right);
    const leftNumber = parseLeadingNumber(leftStem);
    const rightNumber = parseLeadingNumber(rightStem);

    if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
      return leftNumber - rightNumber;
    }

    const byName = leftStem.localeCompare(rightStem, undefined, {
      numeric: true,
      sensitivity: "base",
    });

    if (byName !== 0) {
      return byName;
    }

    return String(left.public_id || "").localeCompare(
      String(right.public_id || ""),
      undefined,
      { numeric: true, sensitivity: "base" },
    );
  });
}
