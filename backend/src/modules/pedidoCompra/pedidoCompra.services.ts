import pool from "../../../bd.js";

// ✅ Criar pedido de compra
export const criarPedidoCompra = async (data: {
  fornecedorId: string;
  appUserId: string;
  numeroNota?: string;
  valorTotal?: number;
}) => {
  const result = await pool.query(
    `
    INSERT INTO "PedidoCompra" ("fornecedorId", "appUserId", "numeroNota", "valorTotal", status, "createdAt")
    VALUES ($1, $2, $3, $4, 'EM_ANDAMENTO', NOW())
    RETURNING *;
    `,
    [data.fornecedorId, data.appUserId, data.numeroNota || null, data.valorTotal || 0]
  );
  return result.rows[0];
};

// ✅ Listar pedidos
export const listarPedidosCompra = async () => {
  const result = await pool.query(`
    SELECT pc.*, f.name AS "fornecedorNome", u.username AS "usuario"
    FROM "PedidoCompra" pc
    LEFT JOIN "Fornecedor" f ON f.id = pc."fornecedorId"
    LEFT JOIN "AppUser" u ON u.id = pc."appUserId"
    ORDER BY pc."createdAt" DESC;
  `);
  return result.rows;
};

// ✅ Obter pedido
export const obterPedidoCompra = async (id: string) => {
  const pedido = await pool.query(
    `
    SELECT * FROM "PedidoCompra" WHERE id = $1;
    `,
    [id]
  );
  if (!pedido.rows.length) return null;

  const itens = await pool.query(
    `
    SELECT ic.*, p.name AS "productName"
    FROM "ItemCompra" ic
    JOIN "Product" p ON p.id = ic."productId"
    WHERE "pedidoCompraId" = $1;
    `,
    [id]
  );

  return { ...pedido.rows[0], itens: itens.rows };
};

// ✅ Atualizar pedido
export const atualizarPedidoCompra = async (id: string, data: any) => {
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(data).forEach(([key, value], i) => {
    fields.push(`"${key}" = $${i + 1}`);
    values.push(value);
  });

  if (!fields.length) throw new Error("Nada para atualizar.");
  values.push(id);

  const result = await pool.query(
    `UPDATE "PedidoCompra" SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *;`,
    values
  );
  return result.rows[0];
};

// ✅ Deletar pedido
export const deletarPedidoCompra = async (id: string) => {
  const result = await pool.query(`DELETE FROM "PedidoCompra" WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0
    ? { message: "Pedido deletado com sucesso." }
    : { message: "Pedido não encontrado." };
};

// ✅ Adicionar item
export const adicionarItemCompra = async (data: {
  pedidoCompraId: string;
  productId: string;
  quantity: number;
  unitCost: number;
  userId: string;
}) => {
  const result = await pool.query(
    `
    INSERT INTO "ItemCompra" ("pedidoCompraId", "productId", quantity, "unitCost")
    VALUES ($1, $2, $3, $4)
    RETURNING *;
    `,
    [data.pedidoCompraId, data.productId, data.quantity, data.unitCost]
  );
  return result.rows[0];
};

// ✅ Remover item
export const removerItemCompra = async (pedidoCompraId: string, itemId: string) => {
  const result = await pool.query(
    `DELETE FROM "ItemCompra" WHERE id = $1 AND "pedidoCompraId" = $2;`,
    [itemId, pedidoCompraId]
  );
  return (result.rowCount ?? 0) > 0
    ? { message: "Item removido com sucesso." }
    : { message: "Item não encontrado." };
};

// ✅ Finalizar pedido → gera lotes e atualiza estoque
export const finalizarPedidoCompra = async (id: string, userId: string, gerarLotes = true) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const pedido = await client.query(`SELECT * FROM "PedidoCompra" WHERE id = $1`, [id]);
    if (!pedido.rows.length) throw new Error("Pedido não encontrado.");

    const itens = await client.query(`SELECT * FROM "ItemCompra" WHERE "pedidoCompraId" = $1`, [id]);
    if (!itens.rows.length) throw new Error("Pedido sem itens.");

    let total = 0;
    for (const item of itens.rows) {
      total += parseFloat(item.totalCost);

      // 🔹 Atualiza estoque geral
      await client.query(
        `UPDATE "Product" SET stock = stock + $1, "costPrice" = $2 WHERE id = $3;`,
        [item.quantity, item.unitCost, item.productId]
      );

      // 🔹 Cria lote automaticamente (caso ativado)
      if (gerarLotes) {
        await client.query(
          `
          INSERT INTO "LoteProduto" ("productId", "batchNumber", quantity, "expirationDate", "createdAt")
          VALUES ($1, CONCAT('L', TO_CHAR(NOW(), 'YYYYMMDDHH24MISS')), $2, NULL, NOW());
          `,
          [item.productId, item.quantity]
        );
      }

      // 🔹 Loga movimento de estoque
      await client.query(
        `
        INSERT INTO "StockMovement" ("productId", type, quantity, "appUserId", "createdAt")
        VALUES ($1, 'ENTRADA', $2, $3, NOW());
        `,
        [item.productId, item.quantity, userId]
      );
    }

    // Atualiza o pedido
    await client.query(
      `UPDATE "PedidoCompra" SET status = 'FINALIZADA', "valorTotal" = $1 WHERE id = $2;`,
      [total, id]
    );

    await client.query("COMMIT");
    return { message: "Pedido finalizado com sucesso e estoque atualizado." };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
