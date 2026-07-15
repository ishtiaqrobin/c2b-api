import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { deleteFileByPublicId } from "../../config/cloudinary.config";
import {
  ICategoryCreate,
  ICategoryUpdate,
  ICategoryListQuery,
  INoticeCreate,
  INoticeUpdate,
} from "./category.interface";

// Reused include shape — `parent` now carries `name` too so the
// dashboard table can show "Sub of: <name>" without extra lookups.
const categoryInclude = {
  parent: { select: { id: true, slug: true, name: true } },
  _count: { select: { children: true, products: true } },
  checkItems: {
    where: { isActive: true },
    orderBy: { sortOrder: "asc" as const },
    select: { id: true, content: true, sortOrder: true },
  },
} satisfies Prisma.CategoryInclude;

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
    // Enforce 2-level hierarchy: Main -> Sub only. A sub-category
    // cannot itself become a parent (no Main -> Sub -> Sub-sub).
    if (parent.parentId) {
      throw new AppError(
        status.BAD_REQUEST,
        "A sub-category cannot be used as a parent. Only main categories can have sub-categories.",
      );
    }
  }

  return prisma.category.create({
    data: {
      slug: payload.slug,
      parentId: payload.parentId ?? null,
      imageUrl: payload.imageUrl ?? null,
      imagePublicId: payload.imagePublicId ?? null,
      isPopular: payload.isPopular ?? false,
      sortOrder: payload.sortOrder ?? 0,
      isActive: payload.isActive ?? true,
      name: payload.name,
    },
    include: categoryInclude,
  });
};

const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id, isDeleted: false },
    include: categoryInclude,
  });

  if (!category) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  return category;
};

const getCategoryBySlug = async (slug: string) => {
  const category = await prisma.category.findUnique({
    where: { slug, isDeleted: false },
    include: categoryInclude,
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
            { name: { contains: query.search, mode: "insensitive" } },
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
      include: categoryInclude,
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
    // Enforce 2-level hierarchy, same rule as createCategory.
    if (parent.parentId) {
      throw new AppError(
        status.BAD_REQUEST,
        "A sub-category cannot be used as a parent. Only main categories can have sub-categories.",
      );
    }
    // If this category currently has children of its own, it can't
    // become a sub-category itself — that would create 3 levels.
    if (payload.parentId !== existing.parentId) {
      const hasChildren = await prisma.category.count({
        where: { parentId: id, isDeleted: false },
      });
      if (hasChildren > 0) {
        throw new AppError(
          status.BAD_REQUEST,
          "This category has sub-categories under it, so it cannot be moved under another category.",
        );
      }
    }
  }

  // If a new image is being uploaded, delete the old one from Cloudinary
  if (payload.imageUrl && existing.imagePublicId) {
    await deleteFileByPublicId(existing.imagePublicId);
  }

  return prisma.category.update({
    where: { id },
    data: {
      ...(payload.slug !== undefined && { slug: payload.slug }),
      ...(payload.parentId !== undefined && {
        parentId: payload.parentId,
      }),
      ...(payload.imageUrl !== undefined && { imageUrl: payload.imageUrl }),
      ...(payload.imagePublicId !== undefined && {
        imagePublicId: payload.imagePublicId,
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
      ...(payload.name !== undefined && { name: payload.name }),
    },
    include: categoryInclude,
  });
};

// const deleteCategory = async (id: string) => {
//   const existing = await prisma.category.findUnique({
//     where: { id, isDeleted: false },
//     include: {
//       _count: { select: { children: true, products: true } },
//     },
//   });
//   if (!existing) {
//     throw new AppError(status.NOT_FOUND, "Category not found");
//   }

//   // Block deletion if sub-categories exist under this one — deleting it
//   // would orphan them and they'd incorrectly surface as root categories
//   // in the public tree.
//   if (existing._count.children > 0) {
//     throw new AppError(
//       status.CONFLICT,
//       "This category has sub-categories under it. Delete or reassign them first.",
//     );
//   }

//   // Block deletion if products still reference this category.
//   if (existing._count.products > 0) {
//     throw new AppError(
//       status.CONFLICT,
//       "This category has products under it. Reassign or remove those products first.",
//     );
//   }

//   // Delete Cloudinary image if present
//   if (existing.imagePublicId) {
//     await deleteFileByPublicId(existing.imagePublicId);
//   }

//   // Soft delete
//   return prisma.category.update({
//     where: { id },
//     data: { isDeleted: true, deletedAt: new Date() },
//     select: { id: true, slug: true, isDeleted: true, deletedAt: true },
//   });
// };

// ==================== CATEGORY NOTICE ====================

const deleteCategory = async (id: string) => {
  const existing = await prisma.category.findUnique({
    where: { id, isDeleted: false },
    include: {
      _count: { select: { children: true, products: true } },
    },
  });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  if (existing._count.children > 0) {
    throw new AppError(
      status.CONFLICT,
      "This category has sub-categories under it. Delete or reassign them first.",
    );
  }

  if (existing._count.products > 0) {
    throw new AppError(
      status.CONFLICT,
      "This category has products under it. Reassign or remove those products first.",
    );
  }

  if (existing.imagePublicId) {
    await deleteFileByPublicId(existing.imagePublicId);
  }

  // Free up the slug so a new category can reuse it, while keeping
  // the row around (soft-deleted) for audit/recovery. The original
  // slug is preserved inside the suffix so restore() can offer it back.
  const releasedSlug = `${existing.slug}__deleted__${Date.now()}`;

  return prisma.category.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      slug: releasedSlug,
      isActive: false, // extra safety: force-hide from any active-only queries
    },
    select: { id: true, slug: true, isDeleted: true, deletedAt: true },
  });
};

// ==================== RESTORE / TRASH ====================

const listDeletedCategories = async () => {
  return prisma.category.findMany({
    where: { isDeleted: true },
    orderBy: { deletedAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      deletedAt: true,
      imageUrl: true,
      parentId: true,
    },
  });
};

const restoreCategory = async (id: string, newSlug?: string) => {
  const existing = await prisma.category.findUnique({
    where: { id, isDeleted: true },
  });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Deleted category not found");
  }

  // Recover the original slug (strip the __deleted__<timestamp> suffix)
  // unless the admin supplies a different one explicitly.
  const originalSlug = existing.slug.split("__deleted__")[0];
  const targetSlug = newSlug || originalSlug;

  const slugTaken = await prisma.category.findUnique({
    where: { slug: targetSlug },
  });
  if (slugTaken) {
    throw new AppError(
      status.CONFLICT,
      `Slug "${targetSlug}" is already in use by another category. Provide a different slug to restore.`,
    );
  }

  // If restoring a sub-category, make sure its parent still exists
  // and is itself not deleted.
  if (existing.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: existing.parentId },
    });
    if (!parent || parent.isDeleted) {
      throw new AppError(
        status.BAD_REQUEST,
        "The parent category no longer exists or is also deleted. Restore the parent first, or clear the parent link.",
      );
    }
  }

  return prisma.category.update({
    where: { id },
    data: {
      isDeleted: false,
      deletedAt: null,
      isActive: true,
      slug: targetSlug,
    },
  });
};

// Permanent delete — only offered from the Trash view, as a deliberate
// separate action from the regular delete button.
const permanentlyDeleteCategory = async (id: string) => {
  const existing = await prisma.category.findUnique({
    where: { id, isDeleted: true },
  });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Deleted category not found");
  }

  if (existing.imagePublicId) {
    await deleteFileByPublicId(existing.imagePublicId);
  }

  await prisma.category.delete({ where: { id } });
  return { id };
};

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
      body: payload.body,
    },
  });
};

const getNoticeByCategoryId = async (categoryId: string) => {
  const notice = await prisma.categoryNotice.findUnique({
    where: { categoryId },
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

  return prisma.categoryNotice.update({
    where: { categoryId },
    data: { body: payload.body },
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
    } else if (!cat.parentId) {
      // Only a category with NO parentId is a real root.
      // (With deleteCategory now blocking deletion while children exist,
      // an orphaned child with a dangling parentId should no longer
      // happen — but we still guard against showing it as a false root.)
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
  listDeletedCategories,
  restoreCategory,
  permanentlyDeleteCategory,
};
