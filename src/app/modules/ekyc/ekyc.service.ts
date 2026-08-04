import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import {
  AccountType,
  AuditAction,
  EkycStatus,
  EkycDocType,
  NotificationChannel,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { deleteFileByPublicId } from "../../config/cloudinary.config";
import { writeAuditLog } from "../../utils/auditLog";
import AppError from "../../errorHelpers/AppError";
import { IEkycUpdate, IEkycListQuery } from "./ekyc.interface";

const CORPORATE_ONLY_DOC_TYPES: EkycDocType[] = [
  EkycDocType.TIN_CERTIFICATE,
  EkycDocType.TRADE_LICENSE,
];

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
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { accountType: true },
  });

  const docTypeEnum = docType as EkycDocType;
  const isCorporate = user?.accountType === AccountType.CORPORATION;

  if (isCorporate && !CORPORATE_ONLY_DOC_TYPES.includes(docTypeEnum)) {
    throw new AppError(
      status.BAD_REQUEST,
      "Corporate accounts can only upload TIN_CERTIFICATE or TRADE_LICENSE documents",
    );
  }

  if (!isCorporate && CORPORATE_ONLY_DOC_TYPES.includes(docTypeEnum)) {
    throw new AppError(
      status.BAD_REQUEST,
      "TIN_CERTIFICATE and TRADE_LICENSE are only allowed for corporate accounts",
    );
  }

  const ekyc = await prisma.ekyc.findUnique({ where: { userId } });

  if (!ekyc) {
    // Auto-create ekyc record on first upload (same as getMyEkyc)
    return prisma.ekyc.create({
      data: {
        userId,
        documents: {
          create: {
            docType: docTypeEnum,
            fileUrl,
            publicId,
          },
        },
      },
      include: { documents: true },
    });
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

  // Audit trail (never fails the operation)
  await writeAuditLog({
    actingUserId,
    action: AuditAction.EKYC_REVIEW,
    entityType: "Ekyc",
    entityId: ekycId,
    description: `eKYC ${payload.status} for user ${ekyc.userId}`,
    before: { status: ekyc.status },
    after: {
      status: payload.status,
      rejectReason: payload.rejectReason ?? null,
    },
  });

  // In-app notification to the customer (never fails the operation)
  try {
    await prisma.notification.create({
      data: {
        userId: ekyc.userId,
        type: "EKYC_RESULT",
        channel: NotificationChannel.IN_APP,
        subject:
          payload.status === EkycStatus.VERIFIED
            ? "Your eKYC has been verified"
            : "Your eKYC was rejected",
        body:
          payload.status === EkycStatus.VERIFIED
            ? "Congratulations! Your identity verification was approved."
            : `Your eKYC submission was rejected. Reason: ${payload.rejectReason ?? "Not provided"}. Please upload corrected documents and resubmit.`,
      },
    });
  } catch (err) {
    console.error("⚠️ Failed to create eKYC notification:", err);
  }

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
