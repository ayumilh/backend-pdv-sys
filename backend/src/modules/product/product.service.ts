import pool from "../../../bd.js";

// Lista produtos com filtro opcional
export const listProducts = async (categoryId?: string, search?: string) => {
  const filters = [];
  const values: any[] = [];

  if (categoryId) {
    filters.push(`"categoryId" = $${values.length + 1}`);
    values.push(categoryId);
  }

  if (search) {
    filters.push(`(LOWER(name) LIKE $${values.length + 1} OR LOWER(barcode) LIKE $${values.length + 1})`);
    values.push(`%${search.toLowerCase()}%`);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const result = await pool.query(`
    SELECT p.*, c.name AS category_name
    FROM "Product" p
    LEFT JOIN "Category" c ON p."categoryId" = c.id
    ${whereClause}
    ORDER BY p."createdAt" DESC
  `, values);

  return result.rows;
};

// Busca produto por ID
export const getProductById = async (id: string) => {
  const result = await pool.query(`
    SELECT p.*, c.name AS category_name
    FROM "Product" p
    LEFT JOIN "Category" c ON p."categoryId" = c.id
    WHERE p.id = $1
  `, [id]);

  return result.rows[0] || null;
};

// Cria um novo produto e registra entrada no estoque
export const createProduct = async (data: {
  name: string;
  price: number;
  stock: number;
  barcode?: string | null;
  imageUrl?: string | null;
  weight?: number | null;
  categoryId?: string | null;
  userId: string;
}) => {
  if (data.price < 0) throw new Error("Preço deve ser maior ou igual a zero.");
  if (data.stock < 0) throw new Error("Estoque não pode ser negativo.");

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const productResult = await client.query(`
      INSERT INTO "Product" (name, price, stock, barcode, "imageUrl", weight, "categoryId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `, [
      data.name,
      data.price,
      data.stock,
      data.barcode || null,
      data.imageUrl || null,
      data.weight || null,
      data.categoryId || null,
    ]);

    const product = productResult.rows[0];

    if (data.stock > 0) {
      await client.query(`
        INSERT INTO "StockMovement" ("productId", quantity, type, "appUserId", "createdAt")
        VALUES ($1, $2, 'ENTRADA', $3, NOW())
      `, [product.id, data.stock, data.userId]);
    }

    await client.query('COMMIT');
    return product;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Atualiza produto
export const updateProduct = async (
  id: string,
  data: {
    name?: string;
    price?: number;
    stock?: number;
    barcode?: string;
    imageUrl?: string;
    weight?: number;
    categoryId?: string;
  }
) => {
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(data).forEach(([key, value], index) => {
    fields.push(`"${key}" = $${index + 1}`);
    values.push(value);
  });

  if (fields.length === 0) throw new Error("Nada para atualizar");

  values.push(id);

  const result = await pool.query(`
    UPDATE "Product"
    SET ${fields.join(', ')}, "updatedAt" = NOW()
    WHERE id = $${values.length}
    RETURNING *
  `, values);

  return result.rows[0];
};

// Deleta produto e movimentos
export const deleteProduct = async (id: string) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query(`SELECT * FROM "Product" WHERE id = $1`, [id]);
    if (!existing.rows.length) {
      await client.query('ROLLBACK');
      return false;
    }

    await client.query(`DELETE FROM "StockMovement" WHERE "productId" = $1`, [id]);
    await client.query(`DELETE FROM "Product" WHERE id = $1`, [id]);

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
