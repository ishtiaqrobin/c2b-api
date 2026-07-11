import { AddressType } from "../../../generated/prisma/enums";

export interface IAddressCreate {
  type?: AddressType;
  label?: string;
  recipientName?: string;
  telephone?: string;
  postCode: string;
  districtId: number;
  cityTownVillage: string;
  streetAddress: string;
  apartment?: string;
  isDefault?: boolean;
}

export interface IAddressUpdate {
  type?: AddressType;
  label?: string;
  recipientName?: string;
  telephone?: string;
  postCode?: string;
  districtId?: number;
  cityTownVillage?: string;
  streetAddress?: string;
  apartment?: string;
  isDefault?: boolean;
}

export interface IDistrictListQuery {
  page?: string;
  limit?: string;
  search?: string;
}
