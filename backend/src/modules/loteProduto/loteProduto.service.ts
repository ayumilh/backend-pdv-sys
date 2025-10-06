import pool from "../../../bd.js";

interface LoteData {
  productId: string;
  batchNumber: string;
  quantity: number;
  expirationDate?: string;
  userId: string;
}

// ✅ Criar novo lote
export const criarLote = async (data: LoteData) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const lote = await client.query(
      `
      INSERT INTO "LoteProduto" ("productId", "batchNumber", quantity, "expirationDate", "createdAt")
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
      `,
      [data.productId, data.batchNumber, data.quantity, data.expirationDate || null]
    );

    // Atualiza o estoque do produto
    await client.query(
      `UPDATE "Product" SET stock = stock + $1 WHERE id = $2`,
      [data.quantity, data.productId]
    );

    // Cria um movimento de entrada
    await client.query(
      `
      INSERT INTO "StockMovement" ("productId", type, quantity, "appUserId", "createdAt")
      VALUES ($1, 'ENTRADA', $2, $3, NOW());
      `,
      [data.productId, data.quantity, data.userId]
    );

    await client.query("COMMIT");
    return lote.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// ✅ Listar todos os lotes
export const listarLotes = async () => {
  const result = await pool.query(`
    SELECT l.*, p.name AS "productName"
    FROM "LoteProduto" l
    JOIN "Product" p ON p.id = l."productId"
    ORDER BY l."createdAt" DESC;
  `);
  return result.rows;
};

// ✅ Obter um lote específico
export const obterLote = async (id: string) => {
  const result = await pool.query(
    `
    SELECT l.*, p.name AS "productName"
    FROM "LoteProduto" l
    JOIN "Product" p ON p.id = l."productId"
    WHERE l.id = $1;
    `,
    [id]
  );
  return result.rows[0] || null;
};

// ✅ Atualizar lote (validade, quantidade, número)
export const atualizarLote = async (
  id: string,
  data: { batchNumber?: string; quantity?: number; expirationDate?: string; userId: string }
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const loteAtual = await client.query(`SELECT * FROM "LoteProduto" WHERE id = $1`, [id]);
    if (!loteAtual.rows.length) throw new Error("Lote não encontrado.");

    const atual = loteAtual.rows[0];
    const diff = data.quantity ? data.quantity - atual.quantity : 0;

    // Atualiza lote
    const result = await client.query(
      `
      UPDATE "LoteProduto"
      SET "batchNumber" = COALESCE($1, "batchNumber"),
          quantity = COALESCE($2, quantity),
          "expirationDate" = COALESCE($3, "expirationDate")
      WHERE id = $4
      RETURNING *;
      `,
      [data.batchNumber, data.quantity, data.expirationDate, id]
    );

    // Atualiza estoque geral e registra movimento
    if (diff !== 0) {
      const tipo = diff > 0 ? "ENTRADA" : "AJUSTE";
      await client.query(
        `INSERT INTO "StockMovement" ("productId", type, quantity, "appUserId", "createdAt")
         VALUES ($1, $2, $3, $4, NOW());`,
        [atual.productId, tipo, Math.abs(diff), data.userId]
      );
      await client.query(
        `UPDATE "Product" SET stock = stock + $1 WHERE id = $2`,
        [diff, atual.productId]
      );
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// ✅ Deletar lote
export const deletarLote = async (id: string) => {
  const result = await pool.query(`DELETE FROM "LoteProduto" WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0
    ? { message: "Lote deletado com sucesso." }
    : { message: "Lote não encontrado." };
};

// ✅ Listar lotes de um produto
export const listarLotesPorProduto = async (productId: string) => {
  const result = await pool.query(
    `
    SELECT *
    FROM "LoteProduto"
    WHERE "productId" = $1
    ORDER BY "expirationDate" ASC NULLS LAST;
    `,
    [productId]
  );
  return result.rows;
};

// ✅ Ajustar quantidade manualmente
export const ajustarQuantidade = async (id: string, quantidade: number, userId: string) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const loteAtual = await client.query(`SELECT * FROM "LoteProduto" WHERE id = $1`, [id]);
    if (!loteAtual.rows.length) throw new Error("Lote não encontrado.");

    const atual = loteAtual.rows[0];
    const diff = quantidade - atual.quantity;

    await client.query(
      `UPDATE "LoteProduto" SET quantity = $1 WHERE id = $2`,
      [quantidade, id]
    );

    if (diff !== 0) {
      const tipo = diff > 0 ? "ENTRADA" : "AJUSTE";
      await client.query(
        `INSERT INTO "StockMovement" ("productId", type, quantity, "appUserId", "createdAt")
         VALUES ($1, $2, $3, $4, NOW());`,
        [atual.productId, tipo, Math.abs(diff), userId]
      );
      await client.query(
        `UPDATE "Product" SET stock = stock + $1 WHERE id = $2`,
        [diff, atual.productId]
      );
    }

    await client.query("COMMIT");
    return { message: "Quantidade ajustada com sucesso." };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
