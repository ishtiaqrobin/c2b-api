import { Locale } from "../../../generated/prisma/enums";

// ---------- Category ----------

export interface ICategoryCreate {
  slug: string;
  parentId?: string | null;
  isPopular?: boolean;
  sortOrder?: number;
  isActive?: boolean;
  translations: ICategoryTranslationInput[];
}

export interface ICategoryUpdate {
  slug?: string;
  parentId?: string | null;
  isPopular?: boolean;
  sortOrder?: number;
  isActive?: boolean;
  translations?: ICategoryTranslationInput[];
}

export interface ICategoryTranslationInput {
  locale: Locale;
  name: string;
}

export interface ICategoryListQuery {
  page?: string;
  limit?: string;
  search?: string;
  parentId?: string;
  isPopular?: string;
  isActive?: string;
  locale?: Locale;
}

// ---------- Category Notice ----------

export interface INoticeCreate {
  categoryId: string;
  translations: INoticeTranslationInput[];
}

export interface INoticeUpdate {
  translations: INoticeTranslationInput[];
}

export interface INoticeTranslationInput {
  locale: Locale;
  body: string;
}
