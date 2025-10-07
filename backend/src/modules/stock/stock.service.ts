import pool from "../../../bd.js";

interface CreateMovementDTO {
  productId: string;
  quantity: number;
  type: 'ENTRADA' | 'SAIDA' | 'AJUSTE' | 'VENDA';
  userId: string;
}

export const getAllMovements = async () => {
  const result = await pool.query(`
    SELECT m.*, p.name AS product_name, u.name AS user_name
    FROM "StockMovement" m
    LEFT JOIN "Product" p ON m."productId" = p.id
    LEFT JOIN "AppUser" u ON m."appUserId" = u.id
    ORDER BY m."createdAt" DESC
  `);
  return result.rows;
};

export const getMovementById = async (id: string) => {
  const result = await pool.query(`
    SELECT m.*, p.name AS product_name, u.name AS user_name
    FROM "StockMovement" m
    LEFT JOIN "Product" p ON m."productId" = p.id
    LEFT JOIN "AppUser" u ON m."appUserId" = u.id
    WHERE m.id = $1
  `, [id]);
  return result.rows[0] || null;
};


export const createMovement = async ({ productId, quantity, type, userId }: CreateMovementDTO) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 🔎 1. Busca o estoque atual do produto
    const { rows } = await client.query(
      'SELECT stock FROM "Product" WHERE id = $1 FOR UPDATE',
      [productId]
    );
    if (rows.length === 0) throw new Error('Produto não encontrado.');

    const currentStock = Number(rows[0].stock);

    // 🚫 2. Impede saída maior que o estoque disponível
    if ((type === 'SAIDA' || type === 'VENDA') && currentStock < quantity) {
      throw new Error('Estoque insuficiente para realizar esta operação.');
    }

    // 📦 3. Cria o movimento
    const movement = await client.query(
      `
      INSERT INTO "StockMovement" ("productId", quantity, type, "appUserId", "createdAt")
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
      `,
      [productId, quantity, type, userId]
    );

    // 🔁 4. Atualiza o estoque conforme o tipo
    const stockChange = type === 'ENTRADA' ? quantity : -quantity;

    await client.query(
      `
      UPDATE "Product"
      SET stock = stock + $1
      WHERE id = $2
      `,
      [stockChange, productId]
    );

    await client.query('COMMIT');
    return movement.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};


export const getMovementsByProduct = async (productId: string) => {
  const result = await pool.query(`
    SELECT 
      m.*, 
      u."name" AS user_name,
      u."email" AS user_email,
      au."role" AS user_role
    FROM "StockMovement" m
    LEFT JOIN "AppUser" au ON m."appUserId" = au.id
    LEFT JOIN "user" u ON au."userId" = u.id
    WHERE m."productId" = $1
    ORDER BY m."createdAt" DESC
  `, [productId]);
  return result.rows;
};

export const deleteMovement = async (id: string) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query(`
      SELECT * FROM "StockMovement" WHERE id = $1
    `, [id]);

    if (existing.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const movement = existing.rows[0];
    const quantityChange = movement.type === 'ENTRADA' ? -movement.quantity : movement.quantity;

    await client.query(`
      UPDATE "Product"
      SET stock = stock + $1
      WHERE id = $2
    `, [quantityChange, movement.productId]);

    await client.query(`
      DELETE FROM "StockMovement" WHERE id = $1
    `, [id]);

    await client.query('COMMIT');
    return movement;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
