import { ItemCondition } from "../../../generated/prisma/enums";

export interface ICartItemAdd {
  variantId: string;
  condition: ItemCondition;
  quantity?: number;
  notes?: string;
  deductionIds?: string[];
}

export interface ICartItemUpdate {
  quantity?: number;
  condition?: ItemCondition;
  notes?: string;
  deductionIds?: string[];
}

export interface ICartItemRemove {
  itemIds: string[];
}
