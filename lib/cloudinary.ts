import { v2 as cloudinary } from "cloudinary";

function getEnv(name: string): string {
  const v = process.env[name];
  if (v == null || v === "") return "";
  return v.replace(/^["']|["']$/g, "").trim();
}

const cloudName = getEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
const apiKey = getEnv("NEXT_PUBLIC_CLOUDINARY_API_KEY");
const apiSecret = getEnv("CLOUDINARY_API_SECRET");

export const cloudinaryConfig = {
  cloudName,
  apiKey,
  apiSecret,
  isConfigured: Boolean(cloudName && apiKey && apiSecret),
};

if (cloudinaryConfig.isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export { cloudinary };
