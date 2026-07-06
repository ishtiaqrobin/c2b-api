/* eslint-disable no-useless-escape */
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { env } from "./env";
import AppError from "../errorHelpers/AppError";
import status from "http-status";

cloudinary.config({
  cloud_name: env.CLOUDINARY.CLOUD_NAME,
  api_key: env.CLOUDINARY.API_KEY,
  api_secret: env.CLOUDINARY.API_SECRET,
});

export const uploadFileToCloudinary = (
  buffer: Buffer,
  fileName: string,
): Promise<UploadApiResponse> => {
  if (!buffer || !fileName) {
    throw new AppError(
      status.BAD_REQUEST,
      "File buffer and file name are required",
    );
  }

  const extension = fileName.split(".").pop()?.toLowerCase();

  const fileNameWithoutExtension = fileName
    .split(".")
    .slice(0, -1)
    .join(".")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\-]/g, "");

  const uniqueName =
    Math.random().toString(36).substring(2) +
    "-" +
    Date.now() +
    "-" +
    fileNameWithoutExtension;

  const folder = extension === "pdf" ? "pdfs" : "images";

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto",
          public_id: `c2b/${folder}/${uniqueName}`,
          folder: `c2b/${folder}`,
        },
        (error, result) => {
          if (error) {
            return reject(
              new AppError(
                status.INTERNAL_SERVER_ERROR,
                "Failed to upload file to Cloudinary",
              ),
            );
          }
          resolve(result as UploadApiResponse);
        },
      )
      .end(buffer);
  });
};

/**
 * Delete a file from Cloudinary by its URL.
 * Extracts the public_id from the Cloudinary URL and destroys the resource.
 * Supports both image and raw (PDF) resource types.
 */
export const deleteFileFromCloudinary = async (url: string): Promise<void> => {
  if (!url) return;

  try {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud}/image/upload/v1234567/folder/subfolder/file.jpg
    // We need to extract: folder/subfolder/file (without extension)
    const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)?$/;
    const match = url.match(regex);

    if (match?.[1]) {
      const publicId = match[1];

      // Try image first, then raw (for PDFs)
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
      });

      if (result.result === "not_found") {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: "raw",
        });
      }
    }
  } catch (error) {
    // Never let Cloudinary cleanup break the main operation.
    console.error("⚠️  Failed to delete file from Cloudinary:", error);
  }
};

/**
 * Delete a file from Cloudinary by its publicId directly.
 * Use this when you have the publicId stored in your database.
 */
export const deleteFileByPublicId = async (publicId: string): Promise<void> => {
  if (!publicId) return;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (result.result === "not_found") {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: "raw",
      });
    }
  } catch (error) {
    console.error("⚠️  Failed to delete file from Cloudinary:", error);
  }
};

export const cloudinaryUpload = cloudinary;
