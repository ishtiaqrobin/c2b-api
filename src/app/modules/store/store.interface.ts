import { Locale } from "../../../generated/prisma/enums";

// ---------- Store ----------

export interface IStoreCreate {
  slug: string;
  isActive?: boolean;
  translations: IStoreTranslationInput[];
  businessHours?: IBusinessHourInput[];
}

export interface IStoreUpdate {
  slug?: string;
  isActive?: boolean;
  translations?: IStoreTranslationInput[];
  businessHours?: IBusinessHourInput[];
}

export interface IStoreTranslationInput {
  locale: Locale;
  name: string;
  address?: string;
}

export interface IBusinessHourInput {
  dayOfWeek: number; // 0 = Sunday ... 6 = Saturday
  openTime?: string; // "10:20"
  closeTime?: string; // "19:00"
  isClosed?: boolean;
}

export interface IStoreListQuery {
  page?: string;
  limit?: string;
  search?: string;
  isActive?: string;
  locale?: Locale;
}
