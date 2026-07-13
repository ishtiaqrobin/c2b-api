export interface INewsCreate {
  publishedAt?: string;
  isActive?: boolean;
  title: string;
  body?: string;
}

export interface INewsUpdate {
  publishedAt?: string;
  isActive?: boolean;
  title?: string;
  body?: string;
}

export interface INewsListQuery {
  page?: string;
  limit?: string;
  isActive?: string;
  search?: string;
}
