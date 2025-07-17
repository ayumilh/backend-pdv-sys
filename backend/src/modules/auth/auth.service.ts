import { prisma } from "../../../prisma/prismaClient";
import { auth } from "../../utils/auth";
import { UserRole } from "@prisma/client";

interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export const register = async (data: RegisterDTO) => {
  const { name, email, password, role } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw { statusCode: 409, message: "Email já está em uso." };
  }

  const result = await auth.api.signUpEmail({
    body: { email, password, name },
    asResponse: false,
  });

  if (!result?.user?.id) {
    throw { statusCode: 500, message: "Erro ao registrar usuário no Auth." };
  }

  const user = await prisma.user.findUnique({
    where: { id: result.user.id },
  });

  if (!user) {
    throw { statusCode: 500, message: "Usuário não encontrado após criação." };
  }

  const appUser = await prisma.appUser.create({
    data: {
      userId: user.id,
      role: role,
    },
  });

  return {
    id: appUser.id,
    name: user.name,
    email: user.email,
    role: appUser.role,
  };
};


interface AuthLoginData {
  email: string;
  password: string;
}

interface AuthLoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string | null;
  };
  headers: Record<string, string | string[]>;
  cookies: string[];
}

export const login = async (data: AuthLoginData): Promise<AuthLoginResponse> => {
  const result = await auth.api.signInEmail({
    body: { email: data.email, password: data.password },
    asResponse: true,
  });

  const headers: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(result.headers || {})) {
    headers[key] = value!;
  }

  const rawSetCookie = result.headers.get("set-cookie");
  const cookies = rawSetCookie
    ? (Array.isArray(rawSetCookie) ? rawSetCookie : [rawSetCookie]).map(cookie =>
        cookie
          .replace(/;\s*SameSite=Lax/i, "; SameSite=None")
          .replace(/;\s*SameSite=Strict/i, "; SameSite=None")
          .replace(/;\s*Secure/i, "") + "; Secure"
      )
    : [];

  const bodyBuffer = await result.arrayBuffer();
  const responseData = JSON.parse(Buffer.from(bodyBuffer).toString());

  if (!responseData?.user?.id || !responseData?.token) {
    throw { statusCode: 401, message: "Credenciais inválidas." };
  }

  const appUser = await prisma.appUser.findUnique({
    where: { userId: responseData.user.id },
    select: { role: true },
  });

  return {
    token: responseData.token,
    user: {
      id: responseData.user.id,
      name: responseData.user.name || "",
      email: responseData.user.email || "",
      role: appUser?.role || null,
    },
    headers,
    cookies,
  };
};

