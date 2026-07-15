export interface ICheckItemCreate {
  categoryId: string;
  content: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ICheckItemUpdate {
  content?: string;
  sortOrder?: number;
  isActive?: boolean;
}
