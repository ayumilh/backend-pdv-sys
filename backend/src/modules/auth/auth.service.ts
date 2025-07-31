import pool from "../../../bd"
import { auth } from "../../utils/auth.js";

interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role: String;
}

export const register = async (data: RegisterDTO) => {
  const { name, email, password, role } = data;

  const existingUser = await pool.query(
    'SELECT * FROM "user" WHERE email = $1',
    [email]
  );

  if ((existingUser.rowCount ?? 0) > 0) {
    throw { statusCode: 409, message: "Email já está em uso." };
  }


  const result = await auth.api.signUpEmail({
    body: { email, password, name },
    asResponse: false,
  });

  if (!result?.user?.id) {
    throw { statusCode: 500, message: "Erro ao registrar usuário no Auth." };
  }

  const userId = result.user.id;
  const userQuery = await pool.query('SELECT * FROM "user" WHERE id = $1', [userId]);
  if (userQuery.rowCount === 0) {
    throw { statusCode: 500, message: "Usuário não encontrado após criação." };
  }

  // Insere na AppUser
  const insertAppUser = await pool.query(
    `INSERT INTO "AppUser" ("userId", role) VALUES ($1, $2) RETURNING id`,
    [userId, role]
  );

  return {
    id: insertAppUser.rows[0].id,
    name: userQuery.rows[0].name,
    email: userQuery.rows[0].email,
    role: role,
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

  const roleResult = await pool.query(
    `SELECT role FROM "AppUser" WHERE "userId" = $1 LIMIT 1`,
    [responseData.user.id]
  );

  const role = roleResult.rows.length > 0 ? roleResult.rows[0].role : null;

  return {
    token: responseData.token,
    user: {
      id: responseData.user.id,
      name: responseData.user.name || "",
      email: responseData.user.email || "",
      role: role,
    },
    headers,
    cookies,
  };
};

