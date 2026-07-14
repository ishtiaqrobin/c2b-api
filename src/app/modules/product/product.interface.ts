import { ItemCondition } from "../../../generated/prisma/enums";

// ---------- Product ----------

export interface IProductCreate {
  slug: string;
  categoryId: string;
  imageUrl?: string;
  imagePublicId?: string;
  isActive?: boolean;
  name: string;
  variants?: IVariantCreate[];
}

export interface IProductUpdate {
  slug?: string;
  categoryId?: string;
  imageUrl?: string;
  imagePublicId?: string;
  isActive?: boolean;
  name?: string;
}

export interface IProductListQuery {
  page?: string;
  limit?: string;
  search?: string;
  categoryId?: string;
  isActive?: string;
}

// ---------- Product Variant ----------

export interface IVariantCreate {
  sku?: string;
  storage?: string;
  color?: string;
  imageUrl?: string; // optional color-specific photo
  imagePublicId?: string;
  newPrice?: number;
  usedPrice?: number;
  currency?: string;
  maxQuantityPerOrder?: number;
  dailyPurchaseLimit?: number;
  isActive?: boolean;
  deductions?: IDeductionCreate[];
}

export interface IVariantUpdate {
  sku?: string;
  storage?: string;
  color?: string;
  imageUrl?: string;
  imagePublicId?: string;
  newPrice?: number;
  usedPrice?: number;
  currency?: string;
  maxQuantityPerOrder?: number;
  dailyPurchaseLimit?: number;
  isActive?: boolean;
}

export interface IVariantListQuery {
  page?: string;
  limit?: string;
  search?: string;
  productId?: string;
  categoryId?: string; // browse all variants under a category (homepage grid)
  storage?: string;
  isActive?: string;
}

// ---------- Variant Deduction ----------

export interface IDeductionCreate {
  condition: ItemCondition;
  amount: number;
  sortOrder?: number;
  isActive?: boolean;
  label: string;
}

export interface IDeductionUpdate {
  condition?: ItemCondition;
  amount?: number;
  sortOrder?: number;
  isActive?: boolean;
  label?: string;
}

// ---------- Price History ----------

export interface IPriceUpdatePayload {
  condition: ItemCondition;
  newPrice: number;
}
