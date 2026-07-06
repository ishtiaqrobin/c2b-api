import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { IStoreCreate, IStoreUpdate, IStoreListQuery } from "./store.interface";

// ==================== STORE ====================

const createStore = async (payload: IStoreCreate) => {
  const existing = await prisma.store.findUnique({
    where: { slug: payload.slug },
  });
  if (existing) {
    throw new AppError(status.CONFLICT, "Store slug already exists");
  }

  return prisma.store.create({
    data: {
      slug: payload.slug,
      isActive: payload.isActive ?? true,
      translations: {
        create: payload.translations,
      },
      ...(payload.businessHours && {
        businessHours: {
          create: payload.businessHours,
        },
      }),
    },
    include: {
      translations: true,
      businessHours: true,
    },
  });
};

const getStoreById = async (id: string) => {
  const store = await prisma.store.findUnique({
    where: { id, isDeleted: false },
    include: {
      translations: true,
      businessHours: { orderBy: { dayOfWeek: "asc" } },
      _count: { select: { orders: true, userRoles: true } },
    },
  });

  if (!store) {
    throw new AppError(status.NOT_FOUND, "Store not found");
  }

  return store;
};

const getStoreBySlug = async (slug: string) => {
  const store = await prisma.store.findUnique({
    where: { slug, isDeleted: false },
    include: {
      translations: true,
      businessHours: { orderBy: { dayOfWeek: "asc" } },
      _count: { select: { orders: true, userRoles: true } },
    },
  });

  if (!store) {
    throw new AppError(status.NOT_FOUND, "Store not found");
  }

  return store;
};

const listStores = async (query: IStoreListQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.StoreWhereInput = {
    isDeleted: false,
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
    prisma.store.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        translations: query.locale ? { where: { locale: query.locale } } : true,
        _count: { select: { orders: true, userRoles: true } },
      },
    }),
    prisma.store.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const updateStore = async (id: string, payload: IStoreUpdate) => {
  const existing = await prisma.store.findUnique({
    where: { id, isDeleted: false },
  });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Store not found");
  }

  if (payload.slug && payload.slug !== existing.slug) {
    const slugTaken = await prisma.store.findUnique({
      where: { slug: payload.slug },
    });
    if (slugTaken) {
      throw new AppError(status.CONFLICT, "Store slug already exists");
    }
  }

  return prisma.$transaction(async (tx) => {
    // Replace translations if provided
    if (payload.translations) {
      await tx.storeTranslation.deleteMany({ where: { storeId: id } });
      await tx.storeTranslation.createMany({
        data: payload.translations.map((t) => ({
          storeId: id,
          locale: t.locale,
          name: t.name,
          address: t.address,
        })),
      });
    }

    // Replace business hours if provided
    if (payload.businessHours) {
      await tx.storeBusinessHour.deleteMany({ where: { storeId: id } });
      await tx.storeBusinessHour.createMany({
        data: payload.businessHours.map((bh) => ({
          storeId: id,
          dayOfWeek: bh.dayOfWeek,
          openTime: bh.openTime,
          closeTime: bh.closeTime,
          isClosed: bh.isClosed ?? false,
        })),
      });
    }

    const updated = await tx.store.update({
      where: { id },
      data: {
        ...(payload.slug !== undefined && { slug: payload.slug }),
        ...(payload.isActive !== undefined && {
          isActive: payload.isActive,
        }),
      },
      include: {
        translations: true,
        businessHours: { orderBy: { dayOfWeek: "asc" } },
        _count: { select: { orders: true, userRoles: true } },
      },
    });

    return updated;
  });
};

const deleteStore = async (id: string) => {
  const existing = await prisma.store.findUnique({
    where: { id, isDeleted: false },
  });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Store not found");
  }

  return prisma.store.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
    select: { id: true, slug: true, isDeleted: true, deletedAt: true },
  });
};

export const StoreService = {
  createStore,
  getStoreById,
  getStoreBySlug,
  listStores,
  updateStore,
  deleteStore,
};
