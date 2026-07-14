export interface IBuybackFeatureCreate {
  title: string;
  description: string;
  imageUrl: string;
  imagePublicId?: string;
  sortOrder?: number;
}

export interface IBuybackFeatureUpdate {
  title?: string;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  sortOrder?: number;
}

export interface IBuybackFeatureQuery {
  page?: string;
  limit?: string;
}
