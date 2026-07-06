import { AuditAction } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";

interface WriteAuditLogParams {
  actingUserId?: string | null; // req.user.userId
  action: AuditAction;
  entityType: string;           // "User", "Order", "Ekyc", "Role", ...
  entityId: string;
  description?: string;
  before?: unknown;             // snapshot before change
  after?: unknown;              // snapshot after change
  ipAddress?: string | null;
  // Optionally run inside an existing transaction.
  tx?: Pick<typeof prisma, "adminProfile" | "auditLog">;
}

/**
 * Writes an entry to the AuditLog. AuditLog.adminId references AdminProfile.id,
 * so we resolve the acting user's AdminProfile (if any). Failures here must
 * never break the main business operation, so errors are swallowed + logged.
 */
export const writeAuditLog = async ({
  actingUserId,
  action,
  entityType,
  entityId,
  description,
  before,
  after,
  ipAddress,
  tx,
}: WriteAuditLogParams): Promise<void> => {
  const client = tx ?? prisma;
  try {
    let adminId: string | null = null;
    if (actingUserId) {
      const adminProfile = await client.adminProfile.findUnique({
        where: { userId: actingUserId },
        select: { id: true },
      });
      adminId = adminProfile?.id ?? null;
    }

    await client.auditLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId,
        description,
        before: (before ?? undefined) as object | undefined,
        after: (after ?? undefined) as object | undefined,
        ipAddress: ipAddress ?? undefined,
      },
    });
  } catch (err) {
    // Never let audit logging break the actual operation.
    console.error("⚠️  Failed to write audit log:", err);
  }
};
