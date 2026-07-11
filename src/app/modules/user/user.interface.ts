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

export interface IRegisterIndividualPayload {
  email: string;
  password: string;
  name: string;
  qualifiedInvoiceStatus?: QualifiedInvoiceStatus;
  profile: {
    fullName: string;
    telephone: string;
    dateOfBirth: string; // ISO date
    sex: Sex;
    occupation?: OccupationType;
  } & IAddressInput;
}

export interface IRegisterCorporationPayload {
  email: string;
  password: string;
  name: string;
  qualifiedInvoiceStatus?: QualifiedInvoiceStatus;
  company: {
    companyName: string;
    companyTelephone: string;
  } & ICompanyAddressInput;
  contact: {
    contactName: string;
    contactTelephone: string;
    contactDateOfBirth: string;
    contactSex: Sex;
    contactOccupation?: OccupationType;
    contactPostCode: string;
    contactDistrictId: number;
    contactCityTownVillage: string;
    contactStreetAddress: string;
    contactApartment?: string;
    bankAccount: string;
    bankAccountBranch: string;
    bankAccountType: BankAccountType;
    bankAccountNumber: string;
    bankAccountName: string;
  };
}

export type IRegisterPayload =
  | ({
      accountType: typeof AccountType.INDIVIDUAL;
    } & IRegisterIndividualPayload)
  | ({
      accountType: typeof AccountType.CORPORATION;
    } & IRegisterCorporationPayload);
