import { Locale } from "../../../generated/prisma/enums";

export interface INewsTranslation {
  locale: Locale;
  title: string;
  body?: string;
}

export interface INewsCreate {
  publishedAt?: string;
  isActive?: boolean;
  translations: INewsTranslation[];
}

export interface INewsUpdate {
  publishedAt?: string;
  isActive?: boolean;
  translations?: INewsTranslation[];
}

export interface INewsListQuery {
  page?: string;
  limit?: string;
  locale?: Locale;
  isActive?: string;
  search?: string;
}
