import { UserType } from "../../generated/prisma/enums";

export interface IStoreScope {
  roleKey: string;
  storeId: string | null; // null = global
}

export interface IRequestUser {
  userId: string;
  email: string;
  userType: UserType;
  permissions: string[]; // effective permission keys, e.g. ["product.create"]
  storeScopes: IStoreScope[]; // role assignments with optional store scope
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: IRequestUser;
    }
  }
}
