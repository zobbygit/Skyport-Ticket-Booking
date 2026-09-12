import { v2 as cloudinary } from "cloudinary";
import { env } from "../../config/env";

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  secure: true,
});

export async function uploadAvatar(fileBuffer: Buffer, userId: string): Promise<string> {
  if (!env.cloudinary.cloudName) {
    throw new Error("Cloudinary is not configured. Set CLOUDINARY_* env vars.");
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "skyport/avatars",
        public_id: userId,
        overwrite: true,
        transformation: [{ width: 256, height: 256, crop: "fill", gravity: "face" }],
      },
      (err, result) => {
        if (err || !result) return reject(err);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
}
