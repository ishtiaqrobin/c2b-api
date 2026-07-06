// Central registry of all permission keys, grouped for the admin UI.
// Convention: "<resource>.<action>".

export const PERMISSIONS = {
  // Catalog
  CATEGORY_MANAGE: "category.manage",
  PRODUCT_MANAGE: "product.manage",
  VARIANT_MANAGE: "variant.manage",
  DEDUCTION_MANAGE: "deduction.manage",
  PRICE_MANAGE: "price.manage",

  // CMS
  BANNER_MANAGE: "banner.manage",
  NEWS_MANAGE: "news.manage",

  // Operations
  STORE_MANAGE: "store.manage",
  ORDER_VIEW: "order.view",
  ORDER_UPDATE: "order.update",
  PAYMENT_MANAGE: "payment.manage",
  EKYC_REVIEW: "ekyc.review",

  // Users & governance
  USER_VIEW: "user.view",
  USER_MANAGE: "user.manage",
  STAFF_MANAGE: "staff.manage",
  ROLE_MANAGE: "role.manage",

  // Insights
  AUDIT_VIEW: "audit.view",
  REPORT_VIEW: "report.view",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Metadata used when seeding the Permission table (group + description).
export const PERMISSION_DEFINITIONS: {
  key: PermissionKey;
  group: string;
  description: string;
}[] = [
  {
    key: PERMISSIONS.CATEGORY_MANAGE,
    group: "Catalog",
    description: "Create, update, delete categories",
  },
  {
    key: PERMISSIONS.PRODUCT_MANAGE,
    group: "Catalog",
    description: "Manage products",
  },
  {
    key: PERMISSIONS.VARIANT_MANAGE,
    group: "Catalog",
    description: "Manage product variants",
  },
  {
    key: PERMISSIONS.DEDUCTION_MANAGE,
    group: "Catalog",
    description: "Manage variant deductions",
  },
  {
    key: PERMISSIONS.PRICE_MANAGE,
    group: "Catalog",
    description: "Change buyback prices",
  },

  {
    key: PERMISSIONS.BANNER_MANAGE,
    group: "CMS",
    description: "Manage banners",
  },
  { key: PERMISSIONS.NEWS_MANAGE, group: "CMS", description: "Manage news" },

  {
    key: PERMISSIONS.STORE_MANAGE,
    group: "Operations",
    description: "Manage stores and business hours",
  },
  {
    key: PERMISSIONS.ORDER_VIEW,
    group: "Operations",
    description: "View orders",
  },
  {
    key: PERMISSIONS.ORDER_UPDATE,
    group: "Operations",
    description: "Update order status / inspection",
  },
  {
    key: PERMISSIONS.PAYMENT_MANAGE,
    group: "Operations",
    description: "Manage payments",
  },
  {
    key: PERMISSIONS.EKYC_REVIEW,
    group: "Operations",
    description: "Review eKYC submissions",
  },

  { key: PERMISSIONS.USER_VIEW, group: "Users", description: "View users" },
  {
    key: PERMISSIONS.USER_MANAGE,
    group: "Users",
    description: "Manage users (soft delete / restore)",
  },
  {
    key: PERMISSIONS.STAFF_MANAGE,
    group: "Users",
    description: "Promote customers to staff",
  },
  {
    key: PERMISSIONS.ROLE_MANAGE,
    group: "Users",
    description: "Manage roles and permissions",
  },

  {
    key: PERMISSIONS.AUDIT_VIEW,
    group: "Insights",
    description: "View audit logs",
  },
  {
    key: PERMISSIONS.REPORT_VIEW,
    group: "Insights",
    description: "View reports",
  },
];

// Default roles and the permission keys each one gets on seed.
// Super Admin is special: it implicitly has every permission (handled in code),
// but we still attach all keys so the DB reflects reality.
export const DEFAULT_ROLES: {
  key: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: PermissionKey[] | "ALL";
}[] = [
  {
    key: "super_admin",
    name: "Super Admin",
    description: "Full access to everything (owner)",
    isSystem: true,
    permissions: "ALL",
  },
  {
    key: "store_manager",
    name: "Store Manager",
    description: "Manages assigned store(s): orders, payments, eKYC review",
    isSystem: true,
    permissions: [
      PERMISSIONS.ORDER_VIEW,
      PERMISSIONS.ORDER_UPDATE,
      PERMISSIONS.PAYMENT_MANAGE,
      PERMISSIONS.EKYC_REVIEW,
      PERMISSIONS.STORE_MANAGE,
    ],
  },
  {
    key: "catalog_manager",
    name: "Catalog Manager",
    description: "Manages catalog: categories, products, variants, prices, CMS",
    isSystem: true,
    permissions: [
      PERMISSIONS.CATEGORY_MANAGE,
      PERMISSIONS.PRODUCT_MANAGE,
      PERMISSIONS.VARIANT_MANAGE,
      PERMISSIONS.DEDUCTION_MANAGE,
      PERMISSIONS.PRICE_MANAGE,
      PERMISSIONS.BANNER_MANAGE,
      PERMISSIONS.NEWS_MANAGE,
    ],
  },
  {
    key: "order_manager",
    name: "Order Manager",
    description: "Handles orders and payments across all stores",
    isSystem: true,
    permissions: [
      PERMISSIONS.ORDER_VIEW,
      PERMISSIONS.ORDER_UPDATE,
      PERMISSIONS.PAYMENT_MANAGE,
    ],
  },
];
