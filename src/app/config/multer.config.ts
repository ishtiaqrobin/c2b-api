/* eslint-disable no-useless-escape */
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";

// Map URL path prefixes to Cloudinary folder names.
// Usage: multerUpload("products") → c2b/products/images/
const MODULE_FOLDER_MAP: Record<string, string> = {
  products: "products",
  banners: "banners",
  ekyc: "ekyc",
  users: "users",
  stores: "stores",
  categories: "categories",
};

const DEFAULT_FOLDER = "misc";

const createStorage = (moduleName: string) =>
  new CloudinaryStorage({
    cloudinary: cloudinaryUpload,
    params: async (_req, file) => {
      const originalName = file.originalname;
      const extension = originalName.split(".").pop()?.toLowerCase();

      const fileNameWithoutExtension = originalName
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

      const subFolder = extension === "pdf" ? "pdfs" : "images";
      const folder = MODULE_FOLDER_MAP[moduleName] ?? DEFAULT_FOLDER;

      return {
        folder: `c2b/${folder}/${subFolder}`,
        public_id: uniqueName,
        resource_type: "auto",
      };
    },
  });

/**
 * Returns a multer upload middleware scoped to a module-specific Cloudinary folder.
 * @param moduleName - Key from MODULE_FOLDER_MAP (e.g. "products", "banners", "ekyc")
 *
 * Usage in route:
 *   multerUpload("products").single("image")
 *   multerUpload("banners").single("image")
 *   multerUpload("ekyc").single("file")
 */
export const multerUpload = (moduleName: string) =>
  multer({ storage: createStorage(moduleName) });
