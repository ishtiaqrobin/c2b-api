import { z } from "zod";
import {
  AccountType,
  Sex,
  QualifiedInvoiceStatus,
  OccupationType,
  BankAccountType,
  PaymentMethod,
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

// ===== Profile update helpers (accept both JSON and FormData) =====
// When a profile form is submitted as multipart/form-data every value arrives
// as a string, so numeric ids need to be coerced to numbers.

const coerceId = (field: string) =>
  z.coerce.number().int().positive(`${field} is required`);

const text = z.string().trim().min(1, "Field must not be empty").max(255);

const date = z.string().refine((v) => !isNaN(Date.parse(v)), "Invalid date");

const sex = z.enum([Sex.MALE, Sex.FEMALE, Sex.OTHER]);

const payoutFields = {
  preferredPayoutMethod: z
    .enum([
      PaymentMethod.BKASH,
      PaymentMethod.NAGAD,
      PaymentMethod.ROCKET,
      PaymentMethod.BANK_TRANSFER,
      PaymentMethod.CASH,
    ])
    .optional(),
  bkashNumber: z.string().max(64).optional(),
  nagadNumber: z.string().max(64).optional(),
  bankAccountName: z.string().max(255).optional(),
  bankAccountNumber: z.string().max(64).optional(),
  bankAccountBranch: z.string().max(255).optional(),
};

const individualUpdate = z.object({
  fullName: text.optional(),
  telephone: z.string().min(8, "Telephone is required").optional(),
  dateOfBirth: date.optional(),
  sex: sex.optional(),
  occupation: occupationSchema.optional(),
  qualifiedInvoiceStatus: qualifiedInvoice,
  postCode: text.optional(),
  districtId: coerceId("District").optional(),
  cityTownVillage: text.optional(),
  streetAddress: text.optional(),
  apartment: z.string().max(255).optional(),
  ...payoutFields,
});

const corporationUpdate = z.object({
  qualifiedInvoiceStatus: z.string().optional(),
  companyName: text.optional(),
  companyTelephone: z.string().min(8).optional(),
  companyPostCode: text.optional(),
  companyDistrictId: coerceId("District").optional(),
  companyCityTownVillage: text.optional(),
  companyStreetAddress: text.optional(),
  companyApartment: z.string().max(255).optional(),
  contactName: text.optional(),
  contactTelephone: z.string().min(8).optional(),
  contactDateOfBirth: date.optional(),
  contactSex: sex.optional(),
  contactOccupation: z.string().max(255).optional(),
  contactPostCode: text.optional(),
  contactDistrictId: coerceId("District").optional(),
  contactCityTownVillage: text.optional(),
  contactStreetAddress: text.optional(),
  contactApartment: z.string().max(255).optional(),
  bankAccount: z.string().max(255).optional(),
  bankAccountBranch: z.string().max(255).optional(),
  bankAccountType: bankAccountTypeSchema.optional(),
  bankAccountNumber: z.string().max(64).optional(),
  bankAccountName: z.string().max(255).optional(),
});

/**
 * Update the authenticated user's own profile. Every field is optional so a
 * user can update just one section at a time. `individual` / `corporation`
 * sub-objects are only applied when the user's accountType matches.
 */
export const updateMyProfileZodSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200).optional(),
  image: z.string().url("Invalid image URL").optional(),
  displayName: z.string().trim().max(200).optional(),
  individual: individualUpdate.optional(),
  corporation: corporationUpdate.optional(),
});

// Payout info — how the business pays the customer for sold items.
// All fields optional so the customer can update just one at a time.
export const updatePayoutInfoZodSchema = z.object({
  preferredPayoutMethod: z
    .enum([
      PaymentMethod.BKASH,
      PaymentMethod.NAGAD,
      PaymentMethod.ROCKET,
      PaymentMethod.BANK_TRANSFER,
      PaymentMethod.CASH,
    ])
    .optional(),
  bkashNumber: z.string().optional(),
  nagadNumber: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountBranch: z.string().optional(),
});