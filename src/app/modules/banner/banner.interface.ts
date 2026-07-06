export interface IBannerCreate {
  categoryId?: string;
  imageUrl: string;
  imagePublicId?: string;
  linkUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface IBannerUpdate {
  categoryId?: string;
  imageUrl?: string;
  imagePublicId?: string;
  linkUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface IBannerListQuery {
  page?: string;
  limit?: string;
  categoryId?: string;
  isActive?: string;
}
