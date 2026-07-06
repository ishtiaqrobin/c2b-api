import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import {
  ICategoryCreate,
  ICategoryUpdate,
  ICategoryListQuery,
  INoticeCreate,
  INoticeUpdate,
} from "./category.interface";

// ==================== CATEGORY ====================

const createCategory = async (payload: ICategoryCreate) => {
  // Ensure slug is unique
  const existing = await prisma.category.findUnique({
    where: { slug: payload.slug },
  });
  if (existing) {
    throw new AppError(status.CONFLICT, "Category slug already exists");
  }

  // Validate parent if provided
  if (payload.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: payload.parentId },
    });
    if (!parent) {
      throw new AppError(status.NOT_FOUND, "Parent category not found");
    }
  }

  return prisma.category.create({
    data: {
      slug: payload.slug,
      parentId: payload.parentId ?? null,
      isPopular: payload.isPopular ?? false,
      sortOrder: payload.sortOrder ?? 0,
      isActive: payload.isActive ?? true,
      translations: {
        create: payload.translations,
      },
    },
    include: {
      translations: true,
      parent: { select: { id: true, slug: true } },
    },
  });
};

const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id, isDeleted: false },
    include: {
      translations: true,
      parent: { select: { id: true, slug: true } },
      _count: { select: { children: true, products: true } },
    },
  });

  if (!category) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  return category;
};

const getCategoryBySlug = async (slug: string) => {
  const category = await prisma.category.findUnique({
    where: { slug, isDeleted: false },
    include: {
      translations: true,
      parent: { select: { id: true, slug: true } },
      _count: { select: { children: true, products: true } },
    },
  });

  if (!category) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  return category;
};

const listCategories = async (query: ICategoryListQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.CategoryWhereInput = {
    isDeleted: false,
    ...(query.isActive !== undefined
      ? { isActive: query.isActive === "true" }
      : {}),
    ...(query.isPopular !== undefined
      ? { isPopular: query.isPopular === "true" }
      : {}),
    ...(query.parentId !== undefined
      ? query.parentId === "null"
        ? { parentId: null }
        : { parentId: query.parentId }
      : {}),
    ...(query.search
      ? {
          OR: [
            { slug: { contains: query.search, mode: "insensitive" } },
            {
              translations: {
                some: {
                  name: { contains: query.search, mode: "insensitive" },
                },
              },
            },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: { sortOrder: "asc" },
      include: {
        translations: query.locale ? { where: { locale: query.locale } } : true,
        parent: { select: { id: true, slug: true } },
        _count: { select: { children: true, products: true } },
      },
    }),
    prisma.category.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const updateCategory = async (id: string, payload: ICategoryUpdate) => {
  const existing = await prisma.category.findUnique({
    where: { id, isDeleted: false },
  });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  // Check slug uniqueness if changing
  if (payload.slug && payload.slug !== existing.slug) {
    const slugTaken = await prisma.category.findUnique({
      where: { slug: payload.slug },
    });
    if (slugTaken) {
      throw new AppError(status.CONFLICT, "Category slug already exists");
    }
  }

  // Validate parent if provided
  if (payload.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: payload.parentId },
    });
    if (!parent) {
      throw new AppError(status.NOT_FOUND, "Parent category not found");
    }
    // Prevent self-referencing
    if (payload.parentId === id) {
      throw new AppError(
        status.BAD_REQUEST,
        "A category cannot be its own parent",
      );
    }
  }

  return prisma.$transaction(async (tx) => {
    // If translations are provided, replace them
    if (payload.translations) {
      await tx.categoryTranslation.deleteMany({ where: { categoryId: id } });
      await tx.categoryTranslation.createMany({
        data: payload.translations.map((t) => ({
          categoryId: id,
          locale: t.locale,
          name: t.name,
        })),
      });
    }

    const updated = await tx.category.update({
      where: { id },
      data: {
        ...(payload.slug !== undefined && { slug: payload.slug }),
        ...(payload.parentId !== undefined && {
          parentId: payload.parentId,
        }),
        ...(payload.isPopular !== undefined && {
          isPopular: payload.isPopular,
        }),
        ...(payload.sortOrder !== undefined && {
          sortOrder: payload.sortOrder,
        }),
        ...(payload.isActive !== undefined && {
          isActive: payload.isActive,
        }),
      },
      include: {
        translations: true,
        parent: { select: { id: true, slug: true } },
        _count: { select: { children: true, products: true } },
      },
    });

    return updated;
  });
};

const deleteCategory = async (id: string) => {
  const existing = await prisma.category.findUnique({
    where: { id, isDeleted: false },
  });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  // Soft delete
  return prisma.category.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
    select: { id: true, slug: true, isDeleted: true, deletedAt: true },
  });
};

// ==================== CATEGORY NOTICE ====================

const createNotice = async (payload: INoticeCreate) => {
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId, isDeleted: false },
  });
  if (!category) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  const existing = await prisma.categoryNotice.findUnique({
    where: { categoryId: payload.categoryId },
  });
  if (existing) {
    throw new AppError(
      status.CONFLICT,
      "Notice already exists for this category. Use update instead.",
    );
  }

  return prisma.categoryNotice.create({
    data: {
      categoryId: payload.categoryId,
      translations: {
        create: payload.translations,
      },
    },
    include: { translations: true },
  });
};

const getNoticeByCategoryId = async (categoryId: string) => {
  const notice = await prisma.categoryNotice.findUnique({
    where: { categoryId },
    include: { translations: true },
  });

  if (!notice) {
    throw new AppError(status.NOT_FOUND, "Notice not found for this category");
  }

  return notice;
};

const updateNotice = async (categoryId: string, payload: INoticeUpdate) => {
  const existing = await prisma.categoryNotice.findUnique({
    where: { categoryId },
  });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Notice not found for this category");
  }

  return prisma.$transaction(async (tx) => {
    // Replace all translations
    await tx.categoryNoticeTranslation.deleteMany({
      where: { noticeId: existing.id },
    });
    await tx.categoryNoticeTranslation.createMany({
      data: payload.translations.map((t) => ({
        noticeId: existing.id,
        locale: t.locale,
        body: t.body,
      })),
    });

    return tx.categoryNotice.findUnique({
      where: { categoryId },
      include: { translations: true },
    });
  });
};

const deleteNotice = async (categoryId: string) => {
  const existing = await prisma.categoryNotice.findUnique({
    where: { categoryId },
  });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Notice not found for this category");
  }

  await prisma.categoryNotice.delete({ where: { categoryId } });
  return { categoryId };
};

// ==================== TREE (public) ====================

const getCategoryTree = async () => {
  const allCategories = await prisma.category.findMany({
    where: { isDeleted: false, isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      translations: true,
      _count: { select: { children: true, products: true } },
    },
  });

  // Build tree structure
  const map = new Map<string, Record<string, unknown>>();
  const roots: Record<string, unknown>[] = [];

  for (const cat of allCategories) {
    map.set(cat.id, { ...cat, children: [] });
  }

  for (const cat of allCategories) {
    const node = map.get(cat.id)!;
    if (cat.parentId && map.has(cat.parentId)) {
      (map.get(cat.parentId)! as { children: unknown[] }).children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
};

export const CategoryService = {
  createCategory,
  getCategoryById,
  getCategoryBySlug,
  listCategories,
  updateCategory,
  deleteCategory,
  createNotice,
  getNoticeByCategoryId,
  updateNotice,
  deleteNotice,
  getCategoryTree,
};
