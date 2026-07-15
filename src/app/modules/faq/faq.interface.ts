export interface IFaqCreate {
  question: string;
  answer: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface IFaqUpdate {
  question?: string;
  answer?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface IFaqListQuery {
  page?: string;
  limit?: string;
  isActive?: string;
}
