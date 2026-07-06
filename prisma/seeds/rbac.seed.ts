import { prisma } from "../../src/app/lib/prisma";
import { UserType } from "../../src/generated/prisma/enums";
import { auth } from "../../src/app/lib/auth";
import { env } from "../../src/app/config/env";
import {
  PERMISSION_DEFINITIONS,
  DEFAULT_ROLES,
} from "../../src/app/utils/permissions";

async function seedPermissions() {
  console.log("🌱 Seeding permissions...");
  for (const def of PERMISSION_DEFINITIONS) {
    await prisma.permission.upsert({
      where: { key: def.key },
      update: { group: def.group, description: def.description },
      create: def,
    });
  }
  console.log(`✅ ${PERMISSION_DEFINITIONS.length} permissions ready.`);
}

async function seedRoles() {
  console.log("🌱 Seeding roles...");

  const allPermissions = await prisma.permission.findMany();
  const permByKey = new Map(allPermissions.map((p) => [p.key, p]));

  for (const roleDef of DEFAULT_ROLES) {
    const role = await prisma.role.upsert({
      where: { key: roleDef.key },
      update: {
        name: roleDef.name,
        description: roleDef.description,
        isSystem: roleDef.isSystem,
      },
      create: {
        key: roleDef.key,
        name: roleDef.name,
        description: roleDef.description,
        isSystem: roleDef.isSystem,
      },
    });

    const keys =
      roleDef.permissions === "ALL"
        ? allPermissions.map((p) => p.key)
        : roleDef.permissions;

    for (const key of keys) {
      const perm = permByKey.get(key);
      if (!perm) continue;
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: perm.id },
        },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }
  console.log(`✅ ${DEFAULT_ROLES.length} roles ready.`);
}

async function seedOwner() {
  console.log("🌱 Seeding owner (super admin)...");

  const ownerEmail = env.OWNER.EMAIL;
  const ownerPassword = env.OWNER.PASSWORD;
  const ownerName = env.OWNER.NAME || "Owner";

  if (!ownerEmail || !ownerPassword) {
    console.warn(
      "⚠️  OWNER_EMAIL / OWNER_PASSWORD not set in env. Skipping owner creation.",
    );
    return;
  }

  let user = await prisma.user.findUnique({ where: { email: ownerEmail } });

  // Create the base user via better-auth if it doesn't exist yet.
  if (!user) {
    await auth.api.signUpEmail({
      body: { email: ownerEmail, password: ownerPassword, name: ownerName },
    });
    user = await prisma.user.findUnique({ where: { email: ownerEmail } });
  }

  if (!user) {
    throw new Error("Failed to create owner user.");
  }

  // Promote to STAFF, verify email, ensure not deleted.
  user = await prisma.user.update({
    where: { id: user.id },
    data: {
      userType: UserType.STAFF,
      emailVerified: true,
      isDeleted: false,
      deletedAt: null,
    },
  });

  // Ensure an AdminProfile exists.
  await prisma.adminProfile.upsert({
    where: { userId: user.id },
    update: { isActive: true },
    create: { userId: user.id, displayName: ownerName, isActive: true },
  });

  // Assign the global super_admin role (storeId = null).
  const superAdminRole = await prisma.role.findUnique({
    where: { key: "super_admin" },
  });
  if (!superAdminRole) {
    throw new Error("super_admin role not found. Did seedRoles run?");
  }

  const existing = await prisma.userRole.findFirst({
    where: {
      userId: user.id,
      roleId: superAdminRole.id,
      storeId: null,
    },
  });

  if (!existing) {
    await prisma.userRole.create({
      data: { userId: user.id, roleId: superAdminRole.id, storeId: null },
    });
  }

  console.log(`✅ Owner ready: ${ownerEmail}`);
}

async function main() {
  await seedPermissions();
  await seedRoles();
  await seedOwner();
  console.log("🎉 RBAC seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ RBAC seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
