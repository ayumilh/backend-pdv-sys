import bcrypt from "bcrypt";
import pool from "../../../bd.js";

interface UserInput {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'CAIXA' | 'ESTOQUISTA';
}

export const userService = {
  async create(data: UserInput) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const result = await pool.query(
      `INSERT INTO "user" (name, email, password, role, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
      [data.name, data.email, hashedPassword, data.role]
    );

    return result.rows[0];
  },

  async update(id: string, data: Partial<UserInput>) {
    const updates: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (data.name) {
      updates.push(`name = $${i++}`);
      values.push(data.name);
    }
    if (data.email) {
      updates.push(`email = $${i++}`);
      values.push(data.email);
    }
    if (data.role) {
      updates.push(`role = $${i++}`);
      values.push(data.role);
    }
    if (data.password) {
      const hashed = await bcrypt.hash(data.password, 10);
      updates.push(`password = $${i++}`);
      values.push(hashed);
    }

    updates.push(`"updatedAt" = NOW()`);

    const query = `
      UPDATE "user" SET ${updates.join(", ")} WHERE id = $${i} RETURNING *;
    `;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async getAll() {
    const result = await pool.query(
      `SELECT id, name, email, role, "createdAt" FROM "user" ORDER BY "createdAt" DESC`
    );
    return result.rows;
  },

  async getStockMovements(userId: string) {
    const result = await pool.query(
      `SELECT sm.*, p.name AS product_name, p.id AS product_id
       FROM "StockMovement" sm
       JOIN "Product" p ON sm."productId" = p.id
       WHERE sm."appUserId" = $1
       ORDER BY sm."createdAt" DESC`,
      [userId]
    );
    return result.rows;
  },

  async getById(id: string) {
    const result = await pool.query(`SELECT * FROM "user" WHERE id = $1`, [id]);
    return result.rows[0] || null;
  },

  async delete(id: string) {
    const result = await pool.query(`DELETE FROM "user" WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
  },

  async emailExists(email: string): Promise<boolean> {
    const result = await pool.query(`SELECT id FROM "user" WHERE email = $1`, [email]);
    return (result.rowCount ?? 0) > 0;
  }
};
