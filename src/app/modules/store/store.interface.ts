// ---------- Store ----------

export interface IStoreCreate {
  slug: string;
  name: string;
  address?: string;
  isActive?: boolean;
  businessHours?: IBusinessHourInput[];
}

export interface IStoreUpdate {
  slug?: string;
  name?: string;
  address?: string;
  isActive?: boolean;
  businessHours?: IBusinessHourInput[];
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

}
