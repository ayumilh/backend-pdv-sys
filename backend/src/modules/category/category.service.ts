import pool from "../../../bd.js";

export const listCategories = async () => {
  const result = await pool.query(`SELECT * FROM "Category" ORDER BY "createdAt" DESC`);
  return result.rows;
};

export const getCategoryById = async (id: string) => {
  const result = await pool.query(`SELECT * FROM "Category" WHERE id = $1 LIMIT 1`, [id]);
  return result.rows[0] || null;
};

export const createCategory = async (data: { name: string }) => {
  const result = await pool.query(
    `INSERT INTO "Category" (name, "createdAt", "updatedAt") VALUES ($1, NOW(), NOW()) RETURNING *`,
    [data.name]
  );
  return result.rows[0];
};

export const updateCategory = async (id: string, data: { name: string }) => {
  const result = await pool.query(
    `UPDATE "Category" SET name = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *`,
    [data.name, id]
  );
  return result.rows[0];
};
