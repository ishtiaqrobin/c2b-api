import { UserType } from "../../../generated/prisma/enums";

export interface IRegisterUserPayload {
  name: string;
  email: string;
  password: string;
}

export interface ILoginUserPayload {
  email: string;
  password: string;
}

export interface IChangedPasswordPayload {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions: boolean;
}

// Shape returned by better-auth's getSession (trimmed to what we use).
export interface ISession {
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string | null;
    userType: UserType;
    accountType: string;
    status: string;
    isActive: boolean;
    isBanned: boolean;
    needPasswordChange: boolean;
    isDeleted: boolean;
    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
}
