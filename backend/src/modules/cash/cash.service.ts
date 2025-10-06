import pool from "../../../bd.js";
import * as fiadoService from '../fiado/fiado.service.js';

interface CancelItemDTO {
  saleId: string;
  saleItemId: string;
  userRole: string;
}

// 1. Abrir Caixa
export const abrirCaixa = async (userId: string, openingAmount: number) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const caixaResult = await client.query(
      `INSERT INTO "CashRegister" ("appUserId", "openingAmount", "openedAt") 
       VALUES ($1, $2, NOW()) RETURNING *`,
      [userId, openingAmount]
    );

    const caixaId = caixaResult.rows[0].id;

    await client.query(
      `INSERT INTO "CashTransaction" ("registerId", type, amount, description, "createdAt") 
       VALUES ($1, 'ABERTURA', $2, 'Abertura de caixa', NOW())`,
      [caixaId, openingAmount]
    );

    await client.query('COMMIT');
    return caixaResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// 2. Fechar Caixa
export const fecharCaixa = async (registerId: string, closingAmount: number) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE "CashRegister" 
       SET "closingAmount" = $1, "closedAt" = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [closingAmount, registerId]
    );

    await client.query(
      `INSERT INTO "CashTransaction" ("registerId", type, amount, description, "createdAt") 
       VALUES ($1, 'FECHAMENTO', $2, 'Fechamento de caixa', NOW())`,
      [registerId, closingAmount]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// 3. Registrar Venda
export const registrarVenda = async (
  userId: string,
  clientId: string | null,
  items: Array<{ productId: string; quantity: number; price: number; weight?: number; loteId?: string }>,
  payments: Array<{ method: string; amount: number }>
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const total = payments.reduce((acc, p) => acc + p.amount, 0);
    const metodoPrincipal = payments[0]?.method || "DINHEIRO";

    const saleResult = await client.query(
      `INSERT INTO "Sale" ("appUserId", "clientId", total, "paymentMethod", status, "createdAt") 
       VALUES ($1, $2, $3, $4, 'FINALIZADA', NOW()) RETURNING id`,
      [userId, clientId, total, metodoPrincipal]
    );

    const saleId = saleResult.rows[0].id;

    // =============================
    // 🔹 ITENS DA VENDA
    // =============================
    for (const item of items) {
      await client.query(
        `INSERT INTO "SaleItem" ("saleId", "productId", quantity, price, weight, "loteId") 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [saleId, item.productId, item.quantity, item.price, item.weight || null, item.loteId || null]
      );

      // 🔹 Se houver lote, dar baixa nele
      if (item.loteId) {
        await client.query(
          `UPDATE "LoteProduto"
           SET quantity = quantity - $1
           WHERE id = $2`,
          [item.quantity, item.loteId]
        );
      }

      // 🔸 Atualiza estoque geral do produto
      await client.query(
        `UPDATE "Product"
         SET stock = stock - $1
         WHERE id = $2`,
        [item.quantity, item.productId]
      );
    }

    // =============================
    // 🔸 PAGAMENTOS
    // =============================
    for (const p of payments) {
      await client.query(
        `INSERT INTO "SalePayment" ("saleId", method, amount)
         VALUES ($1, $2, $3)`,
        [saleId, p.method, p.amount]
      );
    }

    // =============================
    // 💰 TRATAMENTO DE FIADO
    // =============================
    const isFiado = payments.some((p) => p.method.toUpperCase() === "FIADO");
    if (isFiado && clientId) {
      await client.query("COMMIT"); // confirma venda antes de criar fiado

      await fiadoService.registrarFiado({
        userId,
        clienteId: clientId,
        saleId,
        valorTotal: total,
        observacao: "Venda fiada automática",
      });
    } else {
      // 🔸 Caso contrário, registra transação normal de venda no caixa
      const caixaAberto = await client.query(
        `SELECT id FROM "CashRegister"
         WHERE "appUserId" = $1
         AND "closedAt" IS NULL`,
        [userId]
      );

      if (caixaAberto.rows.length) {
        const registerId = caixaAberto.rows[0].id;
        await client.query(
          `INSERT INTO "CashTransaction" ("registerId", type, amount, description, "createdAt") 
           VALUES ($1, 'VENDA', $2, $3, NOW())`,
          [registerId, total, `Venda nº ${saleId}`]
        );
      }

      await client.query("COMMIT");
    }

    return { id: saleId, total };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};


// 4. Registrar Transação
export const registrarTransacao = async (
  registerId: string,
  type: string,
  amount: number,
  description?: string
) => {
  const result = await pool.query(
    `INSERT INTO "CashTransaction" ("registerId", type, amount, description, "createdAt") 
     VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
    [registerId, type, amount, description || null]
  );
  return result.rows[0];
};

// 5. Obter Resumo de Caixa
export const getResumoCaixa = async (registerId: string) => {
  const result = await pool.query(
    `SELECT type, SUM(amount) as total 
     FROM "CashTransaction" 
     WHERE "registerId" = $1 
     GROUP BY type`,
    [registerId]
  );

  const resumo: Record<string, number> = {};
  for (const row of result.rows) {
    resumo[row.type] = parseFloat(row.total);
  }

  return resumo;
};


export const cancelarVenda = async (saleId: string, userRole: string) => {
  if (userRole !== 'ADMIN') throw new Error('Apenas gerentes podem cancelar vendas.');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const sale = await client.query(`SELECT * FROM "Sale" WHERE id = $1`, [saleId]);
    if (!sale.rows.length) throw new Error('Venda não encontrada.');

    // Reverte estoque dos itens
    const items = await client.query(`SELECT "productId", quantity FROM "SaleItem" WHERE "saleId" = $1`, [saleId]);
    for (const item of items.rows) {
      await client.query(
        `UPDATE "Product" SET stock = stock + $1 WHERE id = $2`,
        [item.quantity, item.productId]
      );
    }

    await client.query(`UPDATE "Sale" SET status = 'CANCELADA' WHERE id = $1`, [saleId]);
    await client.query('COMMIT');
    return { message: 'Venda cancelada com sucesso.' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};



export const cancelarItemVenda = async ({ saleId, saleItemId, userRole }: CancelItemDTO) => {
  if (userRole !== 'ADMIN') throw new Error('Apenas gerentes podem cancelar itens.');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verifica se o item existe
    const itemResult = await client.query(
      `SELECT * FROM "SaleItem" WHERE id = $1 AND "saleId" = $2`,
      [saleItemId, saleId]
    );
    if (!itemResult.rows.length) throw new Error('Item não encontrado.');

    const item = itemResult.rows[0];

    // Atualiza estoque do produto
    await client.query(
      `UPDATE "Product" SET stock = stock + $1 WHERE id = $2`,
      [item.quantity, item.productId]
    );

    // Remove o item da venda
    await client.query(
      `DELETE FROM "SaleItem" WHERE id = $1`,
      [saleItemId]
    );

    // Atualiza total da venda
    await client.query(
      `UPDATE "Sale" SET total = total - $1 WHERE id = $2`,
      [item.price * item.quantity, saleId]
    );

    await client.query('COMMIT');
    return { message: 'Item cancelado com sucesso.' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
