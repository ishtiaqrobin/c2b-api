import { Locale, ItemCondition } from "../../../generated/prisma/enums";

// ---------- Product ----------

export interface IProductCreate {
  slug: string;
  categoryId: string;
  imageUrl?: string;
  imagePublicId?: string;
  isActive?: boolean;
  translations: IProductTranslationInput[];
  variants?: IVariantCreate[];
}

export interface IProductUpdate {
  slug?: string;
  categoryId?: string;
  imageUrl?: string;
  imagePublicId?: string;
  isActive?: boolean;
  translations?: IProductTranslationInput[];
}

export interface IProductTranslationInput {
  locale: Locale;
  name: string;
}

export interface IProductListQuery {
  page?: string;
  limit?: string;
  search?: string;
  categoryId?: string;
  isActive?: string;
  locale?: Locale;
}

// ---------- Product Variant ----------

export interface IVariantCreate {
  sku?: string;
  storage?: string;
  color?: string;
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
  storage?: string;
  isActive?: string;
}

// ---------- Variant Deduction ----------

export interface IDeductionCreate {
  condition: ItemCondition;
  amount: number;
  sortOrder?: number;
  isActive?: boolean;
  translations: IDeductionTranslationInput[];
}

export interface IDeductionUpdate {
  condition?: ItemCondition;
  amount?: number;
  sortOrder?: number;
  isActive?: boolean;
  translations?: IDeductionTranslationInput[];
}

export interface IDeductionTranslationInput {
  locale: Locale;
  label: string;
}

// ---------- Price History ----------

export interface IPriceUpdatePayload {
  condition: ItemCondition;
  newPrice: number;
}
