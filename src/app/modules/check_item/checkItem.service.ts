import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import type { ICheckItemCreate, ICheckItemUpdate } from "./checkItem.interface";

const createCheckItem = async (payload: ICheckItemCreate) => {
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId, isDeleted: false },
  });
  if (!category) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  return prisma.categoryCheckItem.create({
    data: {
      categoryId: payload.categoryId,
      content: payload.content,
      sortOrder: payload.sortOrder ?? 0,
      isActive: payload.isActive ?? true,
    },
    include: {
      category: { select: { id: true, slug: true, name: true } },
    },
  });
};

const getCheckItemById = async (id: string) => {
  const item = await prisma.categoryCheckItem.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, slug: true, name: true } },
    },
  });
  if (!item) {
    throw new AppError(status.NOT_FOUND, "Check item not found");
  }
  return item;
};

const getCheckItemsByCategoryId = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId, isDeleted: false },
  });
  if (!category) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  return prisma.categoryCheckItem.findMany({
    where: { categoryId, isActive: true },
    orderBy: { sortOrder: "asc" },
  });
};

const listCheckItems = async (query: {
  page?: string;
  limit?: string;
  search?: string;
  categoryId?: string;
  isActive?: string;
}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.isActive !== undefined
      ? { isActive: query.isActive === "true" }
      : {}),
    ...(query.search
      ? { content: { contains: query.search, mode: "insensitive" } }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.categoryCheckItem.findMany({
      where,
      skip,
      take: limit,
      orderBy: { sortOrder: "asc" },
      include: {
        category: { select: { id: true, slug: true, name: true } },
      },
    }),
    prisma.categoryCheckItem.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const updateCheckItem = async (id: string, payload: ICheckItemUpdate) => {
  const existing = await prisma.categoryCheckItem.findUnique({
    where: { id },
  });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Check item not found");
  }

  return prisma.categoryCheckItem.update({
    where: { id },
    data: {
      ...(payload.content !== undefined && { content: payload.content }),
      ...(payload.sortOrder !== undefined && { sortOrder: payload.sortOrder }),
      ...(payload.isActive !== undefined && { isActive: payload.isActive }),
    },
    include: {
      category: { select: { id: true, slug: true, name: true } },
    },
  });
};

const deleteCheckItem = async (id: string) => {
  const existing = await prisma.categoryCheckItem.findUnique({
    where: { id },
  });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Check item not found");
  }

  await prisma.categoryCheckItem.delete({ where: { id } });
  return { id };
};

export const CheckItemService = {
  createCheckItem,
  getCheckItemById,
  getCheckItemsByCategoryId,
  listCheckItems,
  updateCheckItem,
  deleteCheckItem,
};
