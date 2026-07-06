import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { deleteFileByPublicId } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";
import {
  IProductCreate,
  IProductUpdate,
  IProductListQuery,
  IVariantCreate,
  IVariantUpdate,
  IVariantListQuery,
  IDeductionCreate,
  IDeductionUpdate,
  IPriceUpdatePayload,
} from "./product.interface";

// ==================== PRODUCT ====================

const createProduct = async (payload: IProductCreate) => {
  // Slug uniqueness
  const existing = await prisma.product.findUnique({
    where: { slug: payload.slug },
  });
  if (existing) {
    throw new AppError(status.CONFLICT, "Product slug already exists");
  }

  // Category must exist
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId, isDeleted: false },
  });
  if (!category) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  return prisma.product.create({
    data: {
      slug: payload.slug,
      categoryId: payload.categoryId,
      imageUrl: payload.imageUrl,
      imagePublicId: payload.imagePublicId,
      isActive: payload.isActive ?? true,
      translations: {
        create: payload.translations,
      },
      ...(payload.variants && {
        variants: {
          create: payload.variants.map((v) => ({
            sku: v.sku,
            storage: v.storage,
            color: v.color,
            newPrice: v.newPrice,
            usedPrice: v.usedPrice,
            currency: v.currency ?? "BDT",
            maxQuantityPerOrder: v.maxQuantityPerOrder,
            dailyPurchaseLimit: v.dailyPurchaseLimit,
            isActive: v.isActive ?? true,
            ...(v.deductions && {
              deductions: {
                create: v.deductions.map((d) => ({
                  condition: d.condition,
                  amount: d.amount,
                  sortOrder: d.sortOrder ?? 0,
                  isActive: d.isActive ?? true,
                  translations: {
                    create: d.translations,
                  },
                })),
              },
            }),
          })),
        },
      }),
    },
    include: {
      translations: true,
      variants: {
        include: {
          deductions: { include: { translations: true } },
        },
      },
    },
  });
};

const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id, isDeleted: false },
    include: {
      translations: true,
      category: { select: { id: true, slug: true } },
      variants: {
        where: { isDeleted: false },
        include: {
          deductions: {
            where: { isDeleted: false },
            include: { translations: true },
          },
        },
      },
    },
  });

  if (!product) {
    throw new AppError(status.NOT_FOUND, "Product not found");
  }

  return product;
};

const getProductBySlug = async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug, isDeleted: false },
    include: {
      translations: true,
      category: { select: { id: true, slug: true } },
      variants: {
        where: { isDeleted: false },
        include: {
          deductions: {
            where: { isDeleted: false },
            include: { translations: true },
          },
        },
      },
    },
  });

  if (!product) {
    throw new AppError(status.NOT_FOUND, "Product not found");
  }

  return product;
};

const listProducts = async (query: IProductListQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    isDeleted: false,
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.isActive !== undefined
      ? { isActive: query.isActive === "true" }
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
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        translations: query.locale ? { where: { locale: query.locale } } : true,
        category: { select: { id: true, slug: true } },
        _count: { select: { variants: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const updateProduct = async (id: string, payload: IProductUpdate) => {
  const existing = await prisma.product.findUnique({
    where: { id, isDeleted: false },
  });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Product not found");
  }

  if (payload.slug && payload.slug !== existing.slug) {
    const slugTaken = await prisma.product.findUnique({
      where: { slug: payload.slug },
    });
    if (slugTaken) {
      throw new AppError(status.CONFLICT, "Product slug already exists");
    }
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: payload.categoryId, isDeleted: false },
    });
    if (!category) {
      throw new AppError(status.NOT_FOUND, "Category not found");
    }
  }

  return prisma.$transaction(async (tx) => {
    if (payload.translations) {
      await tx.productTranslation.deleteMany({ where: { productId: id } });
      await tx.productTranslation.createMany({
        data: payload.translations.map((t) => ({
          productId: id,
          locale: t.locale,
          name: t.name,
        })),
      });
    }

    // Delete old image from Cloudinary if image is being changed
    if (
      (payload.imageUrl !== undefined || payload.imagePublicId !== undefined) &&
      existing.imagePublicId
    ) {
      await deleteFileByPublicId(existing.imagePublicId);
    }

    return tx.product.update({
      where: { id },
      data: {
        ...(payload.slug !== undefined && { slug: payload.slug }),
        ...(payload.categoryId !== undefined && {
          categoryId: payload.categoryId,
        }),
        ...(payload.imageUrl !== undefined && { imageUrl: payload.imageUrl }),
        ...(payload.imagePublicId !== undefined && {
          imagePublicId: payload.imagePublicId,
        }),
        ...(payload.isActive !== undefined && {
          isActive: payload.isActive,
        }),
      },
      include: {
        translations: true,
        category: { select: { id: true, slug: true } },
        variants: {
          where: { isDeleted: false },
          include: {
            deductions: {
              where: { isDeleted: false },
              include: { translations: true },
            },
          },
        },
      },
    });
  });
};

const deleteProduct = async (id: string) => {
  const existing = await prisma.product.findUnique({
    where: { id, isDeleted: false },
  });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Product not found");
  }

  // Delete image from Cloudinary
  if (existing.imagePublicId) {
    await deleteFileByPublicId(existing.imagePublicId);
  }

  return prisma.product.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
    select: { id: true, slug: true, isDeleted: true, deletedAt: true },
  });
};

// ==================== VARIANT ====================

const createVariant = async (productId: string, payload: IVariantCreate) => {
  const product = await prisma.product.findUnique({
    where: { id: productId, isDeleted: false },
  });
  if (!product) {
    throw new AppError(status.NOT_FOUND, "Product not found");
  }

  if (payload.sku) {
    const skuTaken = await prisma.productVariant.findUnique({
      where: { sku: payload.sku },
    });
    if (skuTaken) {
      throw new AppError(status.CONFLICT, "SKU already exists");
    }
  }

  return prisma.productVariant.create({
    data: {
      productId,
      sku: payload.sku,
      storage: payload.storage,
      color: payload.color,
      newPrice: payload.newPrice,
      usedPrice: payload.usedPrice,
      currency: payload.currency ?? "BDT",
      maxQuantityPerOrder: payload.maxQuantityPerOrder,
      dailyPurchaseLimit: payload.dailyPurchaseLimit,
      isActive: payload.isActive ?? true,
      ...(payload.deductions && {
        deductions: {
          create: payload.deductions.map((d) => ({
            condition: d.condition,
            amount: d.amount,
            sortOrder: d.sortOrder ?? 0,
            isActive: d.isActive ?? true,
            translations: {
              create: d.translations,
            },
          })),
        },
      }),
    },
    include: {
      deductions: { include: { translations: true } },
    },
  });
};

const getVariantById = async (id: string) => {
  const variant = await prisma.productVariant.findUnique({
    where: { id, isDeleted: false },
    include: {
      product: { select: { id: true, slug: true } },
      deductions: {
        where: { isDeleted: false },
        include: { translations: true },
      },
    },
  });

  if (!variant) {
    throw new AppError(status.NOT_FOUND, "Variant not found");
  }

  return variant;
};

const listVariants = async (query: IVariantListQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.ProductVariantWhereInput = {
    isDeleted: false,
    ...(query.productId ? { productId: query.productId } : {}),
    ...(query.storage ? { storage: query.storage } : {}),
    ...(query.isActive !== undefined
      ? { isActive: query.isActive === "true" }
      : {}),
    ...(query.search
      ? {
          OR: [
            { sku: { contains: query.search, mode: "insensitive" } },
            { storage: { contains: query.search, mode: "insensitive" } },
            { color: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.productVariant.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { id: true, slug: true } },
        deductions: {
          where: { isDeleted: false },
          include: { translations: true },
        },
      },
    }),
    prisma.productVariant.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const updateVariant = async (id: string, payload: IVariantUpdate) => {
  const existing = await prisma.productVariant.findUnique({
    where: { id, isDeleted: false },
  });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Variant not found");
  }

  if (payload.sku && payload.sku !== existing.sku) {
    const skuTaken = await prisma.productVariant.findUnique({
      where: { sku: payload.sku },
    });
    if (skuTaken) {
      throw new AppError(status.CONFLICT, "SKU already exists");
    }
  }

  return prisma.productVariant.update({
    where: { id },
    data: {
      ...(payload.sku !== undefined && { sku: payload.sku }),
      ...(payload.storage !== undefined && { storage: payload.storage }),
      ...(payload.color !== undefined && { color: payload.color }),
      ...(payload.newPrice !== undefined && { newPrice: payload.newPrice }),
      ...(payload.usedPrice !== undefined && { usedPrice: payload.usedPrice }),
      ...(payload.currency !== undefined && { currency: payload.currency }),
      ...(payload.maxQuantityPerOrder !== undefined && {
        maxQuantityPerOrder: payload.maxQuantityPerOrder,
      }),
      ...(payload.dailyPurchaseLimit !== undefined && {
        dailyPurchaseLimit: payload.dailyPurchaseLimit,
      }),
      ...(payload.isActive !== undefined && { isActive: payload.isActive }),
    },
    include: {
      deductions: { include: { translations: true } },
    },
  });
};

const deleteVariant = async (id: string) => {
  const existing = await prisma.productVariant.findUnique({
    where: { id, isDeleted: false },
  });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Variant not found");
  }

  return prisma.productVariant.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
    select: { id: true, sku: true, isDeleted: true, deletedAt: true },
  });
};

// ==================== DEDUCTION ====================

const createDeduction = async (
  variantId: string,
  payload: IDeductionCreate,
) => {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId, isDeleted: false },
  });
  if (!variant) {
    throw new AppError(status.NOT_FOUND, "Variant not found");
  }

  return prisma.variantDeduction.create({
    data: {
      variantId,
      condition: payload.condition,
      amount: payload.amount,
      sortOrder: payload.sortOrder ?? 0,
      isActive: payload.isActive ?? true,
      translations: {
        create: payload.translations,
      },
    },
    include: { translations: true },
  });
};

const updateDeduction = async (
  deductionId: string,
  payload: IDeductionUpdate,
) => {
  const existing = await prisma.variantDeduction.findUnique({
    where: { id: deductionId, isDeleted: false },
  });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Deduction not found");
  }

  return prisma.$transaction(async (tx) => {
    if (payload.translations) {
      await tx.variantDeductionTranslation.deleteMany({
        where: { deductionId },
      });
      await tx.variantDeductionTranslation.createMany({
        data: payload.translations.map((t) => ({
          deductionId,
          locale: t.locale,
          label: t.label,
        })),
      });
    }

    return tx.variantDeduction.update({
      where: { id: deductionId },
      data: {
        ...(payload.condition !== undefined && {
          condition: payload.condition,
        }),
        ...(payload.amount !== undefined && { amount: payload.amount }),
        ...(payload.sortOrder !== undefined && {
          sortOrder: payload.sortOrder,
        }),
        ...(payload.isActive !== undefined && {
          isActive: payload.isActive,
        }),
      },
      include: { translations: true },
    });
  });
};

const deleteDeduction = async (deductionId: string) => {
  const existing = await prisma.variantDeduction.findUnique({
    where: { id: deductionId, isDeleted: false },
  });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Deduction not found");
  }

  return prisma.variantDeduction.update({
    where: { id: deductionId },
    data: { isDeleted: true, deletedAt: new Date() },
    select: { id: true, isDeleted: true, deletedAt: true },
  });
};

// ==================== PRICE HISTORY ====================

const updatePrice = async (
  variantId: string,
  payload: IPriceUpdatePayload,
  actingUserId: string,
) => {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId, isDeleted: false },
  });
  if (!variant) {
    throw new AppError(status.NOT_FOUND, "Variant not found");
  }

  const oldPrice =
    payload.condition === "NEW" ? variant.newPrice : variant.usedPrice;

  return prisma.$transaction(async (tx) => {
    // Update the variant price
    await tx.productVariant.update({
      where: { id: variantId },
      data:
        payload.condition === "NEW"
          ? { newPrice: payload.newPrice }
          : { usedPrice: payload.newPrice },
    });

    // Write price history
    return tx.priceHistory.create({
      data: {
        variantId,
        condition: payload.condition,
        oldPrice,
        newPrice: payload.newPrice,
        changedBy: actingUserId,
      },
    });
  });
};

const getPriceHistory = async (variantId: string, page = 1, limit = 20) => {
  const p = Math.max(1, Number(page));
  const l = Math.min(100, Math.max(1, Number(limit)));
  const [data, total] = await Promise.all([
    prisma.priceHistory.findMany({
      where: { variantId },
      skip: (p - 1) * l,
      take: l,
      orderBy: { createdAt: "desc" },
    }),
    prisma.priceHistory.count({ where: { variantId } }),
  ]);

  return {
    data,
    meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
  };
};

export const ProductService = {
  createProduct,
  getProductById,
  getProductBySlug,
  listProducts,
  updateProduct,
  deleteProduct,
  createVariant,
  getVariantById,
  listVariants,
  updateVariant,
  deleteVariant,
  createDeduction,
  updateDeduction,
  deleteDeduction,
  updatePrice,
  getPriceHistory,
};
