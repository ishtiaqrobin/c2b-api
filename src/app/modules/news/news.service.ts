import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";

import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import {
  INewsCreate,
  INewsUpdate,
  INewsListQuery,
} from "./news.interface";

const listNews = async (query: INewsListQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.NewsWhereInput = {
    isDeleted: false,
    ...(query.isActive !== undefined
      ? { isActive: query.isActive === "true" }
      : {}),
    ...(query.search
      ? { title: { contains: query.search, mode: "insensitive" } }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.news.findMany({
      where,
      skip,
      take: limit,
      orderBy: { publishedAt: "desc" },
    }),
    prisma.news.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getLatestNews = async () => {
  const config = await prisma.siteConfig.findFirst();
  const takeCount = config?.latestNewsCount ?? 10;

  const latestNews = await prisma.news.findMany({
    where: { isDeleted: false, isActive: true },
    orderBy: { publishedAt: "desc" },
    take: takeCount,
  });

  return latestNews;
};

const getNewsById = async (id: string) => {
  const news = await prisma.news.findFirst({
    where: { id, isDeleted: false },
  });

  if (!news) {
    throw new AppError(status.NOT_FOUND, "News not found");
  }

  return news;
};

const createNews = async (payload: INewsCreate) => {
  const news = await prisma.news.create({
    data: {
      publishedAt: payload.publishedAt
        ? new Date(payload.publishedAt)
        : new Date(),
      isActive: payload.isActive ?? true,
      title: payload.title,
      body: payload.body,
    },
  });

  return news;
};

const updateNews = async (id: string, payload: INewsUpdate) => {
  const news = await prisma.news.findFirst({
    where: { id, isDeleted: false },
  });

  if (!news) {
    throw new AppError(status.NOT_FOUND, "News not found");
  }

  const updated = await prisma.news.update({
    where: { id },
    data: {
      ...(payload.publishedAt !== undefined
        ? { publishedAt: new Date(payload.publishedAt) }
        : {}),
      ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.body !== undefined ? { body: payload.body } : {}),
    },
  });

  return updated;
};

const deleteNews = async (id: string) => {
  const news = await prisma.news.findFirst({
    where: { id, isDeleted: false },
  });

  if (!news) {
    throw new AppError(status.NOT_FOUND, "News not found");
  }

  // Soft delete
  await prisma.news.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  return news;
};

export const NewsService = {
  listNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getLatestNews,
};
