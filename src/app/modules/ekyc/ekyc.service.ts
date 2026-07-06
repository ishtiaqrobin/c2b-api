import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { EkycStatus, EkycDocType } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { deleteFileByPublicId } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";
import { IEkycUpdate, IEkycListQuery } from "./ekyc.interface";

const getMyEkyc = async (userId: string) => {
  const ekyc = await prisma.ekyc.findUnique({
    where: { userId },
    include: {
      documents: {
        select: {
          id: true,
          docType: true,
          fileUrl: true,
          publicId: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  if (!ekyc) {
    // Auto-create ekyc record on first access
    return prisma.ekyc.create({
      data: { userId },
      include: {
        documents: true,
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  return ekyc;
};

const getEkycById = async (ekycId: string) => {
  const ekyc = await prisma.ekyc.findUnique({
    where: { id: ekycId },
    include: {
      documents: {
        select: {
          id: true,
          docType: true,
          fileUrl: true,
          publicId: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  if (!ekyc) {
    throw new AppError(status.NOT_FOUND, "eKYC record not found");
  }

  return ekyc;
};

const getEkycByUserId = async (userId: string) => {
  const ekyc = await prisma.ekyc.findUnique({
    where: { userId },
    include: {
      documents: {
        select: {
          id: true,
          docType: true,
          fileUrl: true,
          publicId: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  if (!ekyc) {
    throw new AppError(status.NOT_FOUND, "eKYC record not found for this user");
  }

  return ekyc;
};

const listEkyc = async (query: IEkycListQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.EkycWhereInput = {
    ...(query.status ? { status: query.status as EkycStatus } : {}),
    ...(query.search
      ? {
          user: {
            OR: [
              { email: { contains: query.search, mode: "insensitive" } },
              { name: { contains: query.search, mode: "insensitive" } },
            ],
          },
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.ekyc.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        documents: {
          select: {
            id: true,
            docType: true,
            fileUrl: true,
            createdAt: true,
          },
        },
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    }),
    prisma.ekyc.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const uploadDocument = async (
  userId: string,
  docType: string,
  fileUrl: string,
  publicId: string | null,
) => {
  const ekyc = await prisma.ekyc.findUnique({ where: { userId } });

  if (!ekyc) {
    throw new AppError(status.NOT_FOUND, "eKYC record not found");
  }

  if (ekyc.status === EkycStatus.VERIFIED) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot upload documents for a verified eKYC",
    );
  }

  const document = await prisma.ekycDocument.create({
    data: {
      ekycId: ekyc.id,
      docType: docType as EkycDocType,
      fileUrl,
      publicId,
    },
  });

  // Update ekyc status to PENDING if it was not already
  if (ekyc.status !== EkycStatus.PENDING) {
    await prisma.ekyc.update({
      where: { userId },
      data: { status: EkycStatus.PENDING },
    });
  }

  return document;
};

const removeDocument = async (documentId: string, userId: string) => {
  const document = await prisma.ekycDocument.findUnique({
    where: { id: documentId },
    include: { ekyc: true },
  });

  if (!document) {
    throw new AppError(status.NOT_FOUND, "Document not found");
  }

  if (document.ekyc.userId !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You can only remove your own documents",
    );
  }

  if (document.ekyc.status === EkycStatus.VERIFIED) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot remove documents from a verified eKYC",
    );
  }

  // Delete file from Cloudinary
  if (document.publicId) {
    await deleteFileByPublicId(document.publicId);
  }

  await prisma.ekycDocument.delete({ where: { id: documentId } });

  return document;
};

const updateEkycStatus = async (
  ekycId: string,
  payload: IEkycUpdate,
  actingUserId: string,
) => {
  const ekyc = await prisma.ekyc.findUnique({
    where: { id: ekycId },
  });

  if (!ekyc) {
    throw new AppError(status.NOT_FOUND, "eKYC record not found");
  }

  if (ekyc.status === EkycStatus.VERIFIED) {
    throw new AppError(
      status.BAD_REQUEST,
      "eKYC is already verified and cannot be changed",
    );
  }

  const updated = await prisma.ekyc.update({
    where: { id: ekycId },
    data: {
      status: payload.status,
      rejectReason:
        payload.status === EkycStatus.REJECTED ? payload.rejectReason : null,
      verifiedAt: payload.status === EkycStatus.VERIFIED ? new Date() : null,
    },
    include: {
      documents: {
        select: {
          id: true,
          docType: true,
          fileUrl: true,
          publicId: true,
          createdAt: true,
        },
      },
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: actingUserId,
      action:
        "EKYC_REVIEW" as (typeof import("../../../generated/prisma/enums").AuditAction)[keyof typeof import("../../../generated/prisma/enums").AuditAction],
      entityType: "EKYC",
      entityId: ekycId,
      newValue: JSON.stringify({
        status: payload.status,
        rejectReason: payload.rejectReason ?? null,
      }),
    },
  });

  return updated;
};

export const EkycService = {
  getMyEkyc,
  getEkycById,
  getEkycByUserId,
  listEkyc,
  uploadDocument,
  removeDocument,
  updateEkycStatus,
};
