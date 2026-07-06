import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import {
  IAddressCreate,
  IAddressUpdate,
  IPrefectureListQuery,
} from "./address.interface";

const getMyAddresses = async (userId: string) => {
  return prisma.address.findMany({
    where: { userId, isDeleted: false },
    include: {
      prefecture: {
        select: { id: true, code: true, nameEn: true, nameBn: true },
      },
    },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
};

const getAddressById = async (id: string, userId: string) => {
  const address = await prisma.address.findFirst({
    where: { id, userId, isDeleted: false },
    include: {
      prefecture: {
        select: { id: true, code: true, nameEn: true, nameBn: true },
      },
    },
  });

  if (!address) {
    throw new AppError(status.NOT_FOUND, "Address not found");
  }

  return address;
};

const createAddress = async (userId: string, payload: IAddressCreate) => {
  // Verify prefecture exists
  const prefecture = await prisma.prefecture.findUnique({
    where: { id: payload.prefectureId },
  });
  if (!prefecture) {
    throw new AppError(status.BAD_REQUEST, "Invalid prefecture ID");
  }

  // If setting as default, unset other defaults
  if (payload.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId,
      type: payload.type,
      label: payload.label,
      recipientName: payload.recipientName,
      telephone: payload.telephone,
      postCode: payload.postCode,
      prefectureId: payload.prefectureId,
      cityTownVillage: payload.cityTownVillage,
      streetAddress: payload.streetAddress,
      apartment: payload.apartment,
      isDefault: payload.isDefault ?? false,
    },
    include: {
      prefecture: {
        select: { id: true, code: true, nameEn: true, nameBn: true },
      },
    },
  });

  return address;
};

const updateAddress = async (
  id: string,
  userId: string,
  payload: IAddressUpdate,
) => {
  const address = await prisma.address.findFirst({
    where: { id, userId, isDeleted: false },
  });

  if (!address) {
    throw new AppError(status.NOT_FOUND, "Address not found");
  }

  // Verify prefecture if provided
  if (payload.prefectureId) {
    const prefecture = await prisma.prefecture.findUnique({
      where: { id: payload.prefectureId },
    });
    if (!prefecture) {
      throw new AppError(status.BAD_REQUEST, "Invalid prefecture ID");
    }
  }

  // If setting as default, unset other defaults
  if (payload.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true, id: { not: id } },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.address.update({
    where: { id },
    data: {
      ...(payload.type !== undefined ? { type: payload.type } : {}),
      ...(payload.label !== undefined ? { label: payload.label } : {}),
      ...(payload.recipientName !== undefined
        ? { recipientName: payload.recipientName }
        : {}),
      ...(payload.telephone !== undefined
        ? { telephone: payload.telephone }
        : {}),
      ...(payload.postCode !== undefined ? { postCode: payload.postCode } : {}),
      ...(payload.prefectureId !== undefined
        ? { prefectureId: payload.prefectureId }
        : {}),
      ...(payload.cityTownVillage !== undefined
        ? { cityTownVillage: payload.cityTownVillage }
        : {}),
      ...(payload.streetAddress !== undefined
        ? { streetAddress: payload.streetAddress }
        : {}),
      ...(payload.apartment !== undefined
        ? { apartment: payload.apartment }
        : {}),
      ...(payload.isDefault !== undefined
        ? { isDefault: payload.isDefault }
        : {}),
    },
    include: {
      prefecture: {
        select: { id: true, code: true, nameEn: true, nameBn: true },
      },
    },
  });

  return updated;
};

const deleteAddress = async (id: string, userId: string) => {
  const address = await prisma.address.findFirst({
    where: { id, userId, isDeleted: false },
  });

  if (!address) {
    throw new AppError(status.NOT_FOUND, "Address not found");
  }

  // Soft delete
  await prisma.address.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  return address;
};

const setDefaultAddress = async (id: string, userId: string) => {
  const address = await prisma.address.findFirst({
    where: { id, userId, isDeleted: false },
  });

  if (!address) {
    throw new AppError(status.NOT_FOUND, "Address not found");
  }

  // Unset other defaults
  await prisma.address.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });

  const updated = await prisma.address.update({
    where: { id },
    data: { isDefault: true },
    include: {
      prefecture: {
        select: { id: true, code: true, nameEn: true, nameBn: true },
      },
    },
  });

  return updated;
};

// Prefecture listing
const listPrefectures = async (query: IPrefectureListQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
  const skip = (page - 1) * limit;

  const where: Prisma.PrefectureWhereInput = {
    ...(query.search
      ? {
          OR: [
            { nameEn: { contains: query.search, mode: "insensitive" } },
            { nameBn: { contains: query.search, mode: "insensitive" } },
            { code: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.prefecture.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "asc" },
    }),
    prisma.prefecture.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const AddressService = {
  getMyAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  listPrefectures,
};
