import { z } from "zod";
import {
  AccountType,
  Sex,
  QualifiedInvoiceStatus,
  OccupationType,
  BankAccountType,
} from "../../../generated/prisma/enums";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password must be at most 64 characters");

const addressFields = {
  postCode: z.string().min(1, "Post code is required"),
  districtId: z.number().int().positive("District is required"),
  cityTownVillage: z.string().min(1, "City/Town/Village is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  apartment: z.string().optional(),
};

const companyAddressFields = {
  companyPostCode: z.string().min(1, "Post code is required"),
  companyDistrictId: z.number().int().positive("District is required"),
  companyCityTownVillage: z.string().min(1, "City/Town/Village is required"),
  companyStreetAddress: z.string().min(1, "Street address is required"),
  companyApartment: z.string().optional(),
};

const qualifiedInvoice = z
  .enum([
    QualifiedInvoiceStatus.NOT_APPLICABLE,
    QualifiedInvoiceStatus.TARGET_AUDIENCE,
  ])
  .optional();

const occupationSchema = z.enum([
  OccupationType.COMPANY_EMPLOYEE,
  OccupationType.SELF_EMPLOYED,
  OccupationType.PART_TIME_JOB,
  OccupationType.STUDENT,
  OccupationType.UNEMPLOYED,
  OccupationType.HOUSEWIFE,
  OccupationType.OTHERS,
]);

const bankAccountTypeSchema = z.enum([
  BankAccountType.SAVINGS,
  BankAccountType.CURRENT,
]);

export const registerIndividualZodSchema = z.object({
  accountType: z.literal(AccountType.INDIVIDUAL),
  email: z.string().email("Invalid email"),
  password: passwordSchema,
  name: z.string().min(1, "Name is required"),
  qualifiedInvoiceStatus: qualifiedInvoice,
  profile: z.object({
    fullName: z.string().min(1, "Full name is required"),
    telephone: z.string().min(8, "Telephone is required"),
    dateOfBirth: z
      .string()
      .refine((v) => !isNaN(Date.parse(v)), "Invalid date"),
    sex: z.enum([Sex.MALE, Sex.FEMALE, Sex.OTHER]),
    occupation: occupationSchema.optional(),
    ...addressFields,
  }),
});

export const registerCorporationZodSchema = z.object({
  accountType: z.literal(AccountType.CORPORATION),
  email: z.string().email("Invalid email"),
  password: passwordSchema,
  name: z.string().min(1, "Name is required"),
  qualifiedInvoiceStatus: z.string("Qualified invoice status is required"),
  company: z.object({
    companyName: z.string().min(1, "Company name is required"),
    companyTelephone: z.string().min(8, "Company telephone is required"),
    ...companyAddressFields,
  }),
  contact: z.object({
    contactName: z.string().min(1, "Contact name is required"),
    contactTelephone: z.string().min(8, "Contact telephone is required"),
    contactDateOfBirth: z
      .string()
      .refine((v) => !isNaN(Date.parse(v)), "Invalid date"),
    contactSex: z.enum([Sex.MALE, Sex.FEMALE, Sex.OTHER]),
    contactOccupation: occupationSchema.optional(),
    contactPostCode: z.string().min(1, "Post code is required"),
    contactDistrictId: z.number().int().positive("District is required"),
    contactCityTownVillage: z.string().min(1, "City/Town/Village is required"),
    contactStreetAddress: z.string().min(1, "Street address is required"),
    contactApartment: z.string().optional(),
    bankAccount: z.string().min(1, "Bank account is required"),
    bankAccountBranch: z.string().min(1, "Bank branch is required"),
    bankAccountType: bankAccountTypeSchema,
    bankAccountNumber: z.string().min(1, "Bank account number is required"),
    bankAccountName: z.string().min(1, "Bank account name is required"),
  }),
});

// Discriminated union so the correct schema is picked by accountType.
export const registerZodSchema = z.discriminatedUnion("accountType", [
  registerIndividualZodSchema,
  registerCorporationZodSchema,
]);
