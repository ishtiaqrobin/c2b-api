import {
  AccountType,
  Sex,
  QualifiedInvoiceStatus,
} from "../../../generated/prisma/enums";

interface IAddressInput {
  postCode: string;
  prefectureId: number;
  cityTownVillage: string;
  streetAddress: string;
  apartment?: string;
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
    occupation?: string;
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
  } & {
    postCode: string;
    prefectureId: number;
    cityTownVillage: string;
    streetAddress: string;
    apartment?: string;
  };
  contact: {
    contactName: string;
    contactTelephone: string;
    contactDateOfBirth: string;
    contactSex: Sex;
    contactOccupation?: string;
    contactPostCode: string;
    contactPrefectureId: number;
    contactCityTownVillage: string;
    contactStreetAddress: string;
    contactApartment?: string;
    bankAccount: string;
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
