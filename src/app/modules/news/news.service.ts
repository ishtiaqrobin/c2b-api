import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { Locale } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import {
  INewsCreate,
  INewsUpdate,
  INewsListQuery,
  INewsTranslation,
} from "./news.interface";

const listNews = async (query: INewsListQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const locale = (query.locale as Locale) || Locale.EN;

  const where: Prisma.NewsWhereInput = {
    isDeleted: false,
    ...(query.isActive !== undefined
      ? { isActive: query.isActive === "true" }
      : {}),
    ...(query.search
      ? {
          translations: {
            some: {
              locale,
              title: { contains: query.search, mode: "insensitive" },
            },
          },
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.news.findMany({
      where,
      skip,
      take: limit,
      orderBy: { publishedAt: "desc" },
      include: {
        translations: {
          where: { locale },
          select: { locale: true, title: true, body: true },
        },
      },
    }),
    prisma.news.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getNewsById = async (id: string, locale?: Locale) => {
  const news = await prisma.news.findFirst({
    where: { id, isDeleted: false },
    include: {
      translations: locale
        ? {
            where: { locale },
            select: { locale: true, title: true, body: true },
          }
        : true,
    },
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
      translations: {
        create: payload.translations.map((t: INewsTranslation) => ({
          locale: t.locale,
          title: t.title,
          body: t.body,
        })),
      },
    },
    include: { translations: true },
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

  // Update base fields
  const updated = await prisma.news.update({
    where: { id },
    data: {
      ...(payload.publishedAt !== undefined
        ? { publishedAt: new Date(payload.publishedAt) }
        : {}),
      ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
    },
  });

  // Replace translations if provided
  if (payload.translations) {
    // Delete existing translations
    await prisma.newsTranslation.deleteMany({ where: { newsId: id } });

    // Create new translations
    await prisma.newsTranslation.createMany({
      data: payload.translations.map((t: INewsTranslation) => ({
        newsId: id,
        locale: t.locale,
        title: t.title,
        body: t.body,
      })),
    });
  }

  return prisma.news.findUnique({
    where: { id },
    include: { translations: true },
  });
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
};
