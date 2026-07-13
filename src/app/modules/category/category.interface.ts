// ---------- Category ----------

export interface ICategoryCreate {
  slug: string;
  parentId?: string | null;
  imageUrl?: string;
  imagePublicId?: string | null;
  isPopular?: boolean;
  sortOrder?: number;
  isActive?: boolean;
  name: string;
}

export interface ICategoryUpdate {
  slug?: string;
  parentId?: string | null;
  imageUrl?: string;
  imagePublicId?: string | null;
  isPopular?: boolean;
  sortOrder?: number;
  isActive?: boolean;
  name?: string;
}

export interface ICategoryListQuery {
  page?: string;
  limit?: string;
  search?: string;
  parentId?: string;
  isPopular?: string;
  isActive?: string;
}

// ---------- Category Notice ----------

export interface INoticeCreate {
  categoryId: string;
  body: string;
}

export interface INoticeUpdate {
  body: string;
}
