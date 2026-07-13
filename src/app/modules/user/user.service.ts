import status from "http-status";
import {
  AccountType,
  QualifiedInvoiceStatus,
} from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { tokenUtils } from "../../utils/token";

export const UserService = {
  // register,
  // getMe,
};
