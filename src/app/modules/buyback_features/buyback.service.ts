import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { deleteFileByPublicId } from "../../config/cloudinary.config";
import {
  IBuybackFeatureCreate,
  IBuybackFeatureUpdate,
  IBuybackFeatureQuery,
} from "./buyback.interface";

const list = async (query: IBuybackFeatureQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.BuybackFeatureWhereInput = {};

  const [data, total] = await Promise.all([
    prisma.buybackFeature.findMany({
      where,
      skip,
      take: limit,
      orderBy: { sortOrder: "asc" },
    }),
    prisma.buybackFeature.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getById = async (id: string) => {
  const feature = await prisma.buybackFeature.findUnique({ where: { id } });

  if (!feature) {
    throw new AppError(status.NOT_FOUND, "Buyback feature not found");
  }

  return feature;
};

const create = async (payload: IBuybackFeatureCreate) => {
  const feature = await prisma.buybackFeature.create({
    data: {
      title: payload.title,
      description: payload.description,
      imageUrl: payload.imageUrl,
      imagePublicId: payload.imagePublicId ?? null,
      sortOrder: payload.sortOrder ?? 0,
    },
  });

  return feature;
};

const update = async (id: string, payload: IBuybackFeatureUpdate) => {
  const feature = await prisma.buybackFeature.findUnique({ where: { id } });

  if (!feature) {
    throw new AppError(status.NOT_FOUND, "Buyback feature not found");
  }

  if (payload.imageUrl && feature.imagePublicId) {
    await deleteFileByPublicId(feature.imagePublicId);
  }

  const updated = await prisma.buybackFeature.update({
    where: { id },
    data: {
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.description !== undefined
        ? { description: payload.description }
        : {}),
      ...(payload.imageUrl !== undefined ? { imageUrl: payload.imageUrl } : {}),
      ...(payload.imagePublicId !== undefined
        ? { imagePublicId: payload.imagePublicId }
        : {}),
      ...(payload.sortOrder !== undefined
        ? { sortOrder: payload.sortOrder }
        : {}),
    },
  });

  return updated;
};

const remove = async (id: string) => {
  const feature = await prisma.buybackFeature.findUnique({ where: { id } });

  if (!feature) {
    throw new AppError(status.NOT_FOUND, "Buyback feature not found");
  }

  if (feature.imagePublicId) {
    await deleteFileByPublicId(feature.imagePublicId);
  }

  await prisma.buybackFeature.delete({ where: { id } });

  return feature;
};

export const BuybackFeatureService = {
  list,
  getById,
  create,
  update,
  remove,
};
