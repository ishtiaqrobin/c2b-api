import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import {
  IBannerCreate,
  IBannerUpdate,
  IBannerListQuery,
} from "./banner.interface";

const listBanners = async (query: IBannerListQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.BannerWhereInput = {
    isDeleted: false,
    ...(query.categoryId !== undefined
      ? { categoryId: query.categoryId || null }
      : {}),
    ...(query.isActive !== undefined
      ? { isActive: query.isActive === "true" }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.banner.findMany({
      where,
      skip,
      take: limit,
      orderBy: { sortOrder: "asc" },
      include: {
        category: { select: { id: true, slug: true } },
      },
    }),
    prisma.banner.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getBannerById = async (id: string) => {
  const banner = await prisma.banner.findFirst({
    where: { id, isDeleted: false },
    include: {
      category: { select: { id: true, slug: true } },
    },
  });

  if (!banner) {
    throw new AppError(status.NOT_FOUND, "Banner not found");
  }

  return banner;
};

const createBanner = async (payload: IBannerCreate) => {
  // Verify category if provided
  if (payload.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: payload.categoryId, isDeleted: false },
    });
    if (!category) {
      throw new AppError(status.BAD_REQUEST, "Invalid category ID");
    }
  }

  const banner = await prisma.banner.create({
    data: {
      categoryId: payload.categoryId ?? null,
      imageUrl: payload.imageUrl,
      imagePublicId: payload.imagePublicId ?? null,
      linkUrl: payload.linkUrl ?? null,
      sortOrder: payload.sortOrder ?? 0,
      isActive: payload.isActive ?? true,
    },
    include: {
      category: { select: { id: true, slug: true } },
    },
  });

  return banner;
};

const updateBanner = async (id: string, payload: IBannerUpdate) => {
  const banner = await prisma.banner.findFirst({
    where: { id, isDeleted: false },
  });

  if (!banner) {
    throw new AppError(status.NOT_FOUND, "Banner not found");
  }

  // Verify category if provided
  if (payload.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: payload.categoryId, isDeleted: false },
    });
    if (!category) {
      throw new AppError(status.BAD_REQUEST, "Invalid category ID");
    }
  }

  const updated = await prisma.banner.update({
    where: { id },
    data: {
      ...(payload.categoryId !== undefined
        ? { categoryId: payload.categoryId }
        : {}),
      ...(payload.imageUrl !== undefined ? { imageUrl: payload.imageUrl } : {}),
      ...(payload.imagePublicId !== undefined
        ? { imagePublicId: payload.imagePublicId }
        : {}),
      ...(payload.linkUrl !== undefined ? { linkUrl: payload.linkUrl } : {}),
      ...(payload.sortOrder !== undefined
        ? { sortOrder: payload.sortOrder }
        : {}),
      ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
    },
    include: {
      category: { select: { id: true, slug: true } },
    },
  });

  return updated;
};

const deleteBanner = async (id: string) => {
  const banner = await prisma.banner.findFirst({
    where: { id, isDeleted: false },
  });

  if (!banner) {
    throw new AppError(status.NOT_FOUND, "Banner not found");
  }

  // Soft delete
  await prisma.banner.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  return banner;
};

export const BannerService = {
  listBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
};
