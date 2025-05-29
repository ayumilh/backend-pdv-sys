import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../../prisma/prismaClient";
import { UserRole } from "@prisma/client";


interface AuthRequestData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface AuthLoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    role: UserRole;
  };
}

export const register = async ({ name, email, password, role }: AuthRequestData) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw { statusCode: 409, message: "Email já está em uso." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const login = async (email: string, password: string): Promise<AuthLoginResponse> => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw { statusCode: 401, message: "Credenciais inválidas" };
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw { statusCode: 500, message: "JWT_SECRET não configurado" };

  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, jwtSecret, {
    expiresIn: "8h",
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
  };
};
