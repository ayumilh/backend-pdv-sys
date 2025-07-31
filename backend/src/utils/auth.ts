import "dotenv/config";
import { betterAuth } from "better-auth";
import pkg from 'pg';
const { Pool } = pkg;

export const auth = betterAuth({
  emailAndPassword: { enabled: true },
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  trustedOrigins: ['http://localhost:3000'],
});


