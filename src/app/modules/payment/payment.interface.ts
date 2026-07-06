import { PaymentStatus } from "../../../generated/prisma/enums";

export interface IPaymentUpdate {
  status: PaymentStatus;
  method?: string;
  reference?: string;
}

export interface IPaymentListQuery {
  page?: string;
  limit?: string;
  status?: PaymentStatus;
  orderId?: string;
  method?: string;
  search?: string;
}
