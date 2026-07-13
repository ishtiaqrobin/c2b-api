import {
  AccountType,
  Sex,
  QualifiedInvoiceStatus,
  OccupationType,
  BankAccountType,
} from "../../../generated/prisma/enums";

interface IAddressInput {
  postCode: string;
  districtId: number;
  cityTownVillage: string;
  streetAddress: string;
  apartment?: string;
}

interface ICompanyAddressInput {
  companyPostCode: string;
  companyDistrictId: number;
  companyCityTownVillage: string;
  companyStreetAddress: string;
  companyApartment?: string;
}


