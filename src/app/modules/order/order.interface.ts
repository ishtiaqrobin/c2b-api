import {
  BuybackMethod,
  Courier,
  ItemCondition,
  OrderStatus,
} from "../../../generated/prisma/enums";

// ---------- Order ----------

export interface IOrderCreate {
  method: BuybackMethod;
  storeId?: string; // required for IN_STORE
  shippingAddressId?: string; // required for MAIL_IN
  courier?: Courier; // required for MAIL_IN
  items: IOrderItemInput[];
}

export interface IOrderItemInput {
  variantId: string;
  condition: ItemCondition;
  quantity?: number;
  notes?: string;
  deductionIds?: string[]; // selected deduction IDs
}

export interface IOrderUpdate {
  status?: OrderStatus;
  note?: string;
  trackingNumber?: string;
}

export interface IOrderListQuery {
  page?: string;
  limit?: string;
  status?: OrderStatus;
  userId?: string;
  storeId?: string;
  method?: BuybackMethod;
  search?: string; // searches orderNumber
  locale?: string;
}

export interface IOrderStatusUpdate {
  status: OrderStatus;
  note?: string;
}
