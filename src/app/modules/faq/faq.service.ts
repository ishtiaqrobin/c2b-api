import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { IFaqCreate, IFaqUpdate, IFaqListQuery } from "./faq.interface";

const listFaqs = async (query: IFaqListQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.FaqWhereInput = {
    isDeleted: false,
    ...(query.isActive !== undefined
      ? { isActive: query.isActive === "true" }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.faq.findMany({
      where,
      skip,
      take: limit,
      orderBy: { sortOrder: "asc" },
    }),
    prisma.faq.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getFaqById = async (id: string) => {
  const faq = await prisma.faq.findFirst({
    where: { id, isDeleted: false },
  });

  if (!faq) {
    throw new AppError(status.NOT_FOUND, "FAQ not found");
  }

  return faq;
};

const createFaq = async (payload: IFaqCreate) => {
  const faq = await prisma.faq.create({
    data: {
      question: payload.question,
      answer: payload.answer,
      sortOrder: payload.sortOrder ?? 0,
      isActive: payload.isActive ?? true,
    },
  });

  return faq;
};

const updateFaq = async (id: string, payload: IFaqUpdate) => {
  const faq = await prisma.faq.findFirst({
    where: { id, isDeleted: false },
  });

  if (!faq) {
    throw new AppError(status.NOT_FOUND, "FAQ not found");
  }

  const updated = await prisma.faq.update({
    where: { id },
    data: {
      ...(payload.question !== undefined ? { question: payload.question } : {}),
      ...(payload.answer !== undefined ? { answer: payload.answer } : {}),
      ...(payload.sortOrder !== undefined
        ? { sortOrder: payload.sortOrder }
        : {}),
      ...(payload.isActive !== undefined
        ? { isActive: payload.isActive }
        : {}),
    },
  });

  return updated;
};

const deleteFaq = async (id: string) => {
  const faq = await prisma.faq.findFirst({
    where: { id, isDeleted: false },
  });

  if (!faq) {
    throw new AppError(status.NOT_FOUND, "FAQ not found");
  }

  await prisma.faq.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  return faq;
};

export const FaqService = {
  listFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
};
