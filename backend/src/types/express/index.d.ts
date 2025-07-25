import { UserRole } from "@prisma/client";

declare module "express" {
  interface Request {
    usuario?: {
      id: string;
      name: string;
      email?: string;
      role: UserRole;
    };
  }
}
