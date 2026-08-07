import {
  Sex,
  OccupationType,
  PaymentMethod,
  BankAccountType,
  QualifiedInvoiceStatus,
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

export interface IPayoutUpdate {
  preferredPayoutMethod?: PaymentMethod;
  bkashNumber?: string;
  nagadNumber?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankAccountBranch?: string;
}

// Optional profile update payload — every field is optional so a user can
// update a single section at a time. Nested `individual` / `corporation`
// objects are only applied when the user's accountType matches.
export interface IUpdateIndividualProfile {
  fullName?: string;
  telephone?: string;
  dateOfBirth?: string;
  sex?: "MALE" | "FEMALE" | "OTHER";
  occupation?: OccupationType;
  qualifiedInvoiceStatus?: "NOT_APPLICABLE" | "TARGET_AUDIENCE";
  postCode?: string;
  districtId?: number;
  cityTownVillage?: string;
  streetAddress?: string;
  apartment?: string;
  preferredPayoutMethod?: PaymentMethod;
  bkashNumber?: string;
  nagadNumber?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankAccountBranch?: string;
}

export interface IUpdateCorporationProfile {
  qualifiedInvoiceStatus?: string;
  companyName?: string;
  companyTelephone?: string;
  companyPostCode?: string;
  companyDistrictId?: number;
  companyCityTownVillage?: string;
  companyStreetAddress?: string;
  companyApartment?: string;
  contactName?: string;
  contactTelephone?: string;
  contactDateOfBirth?: string;
  contactSex?: "MALE" | "FEMALE" | "OTHER";
  contactOccupation?: string;
  contactPostCode?: string;
  contactDistrictId?: number;
  contactCityTownVillage?: string;
  contactStreetAddress?: string;
  contactApartment?: string;
  bankAccount?: string;
  bankAccountBranch?: string;
  bankAccountType?: BankAccountType;
  bankAccountName?: string;
  bankAccountNumber?: string;
}

export interface IUpdateMyProfilePayload {
  name?: string;
  image?: string;
  displayName?: string; // AdminProfile.displayName (STAFF / super owner only)
  individual?: IUpdateIndividualProfile;
  corporation?: IUpdateCorporationProfile;
}