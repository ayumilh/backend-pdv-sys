import pool from "../../../bd.js";

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
  items: Array<{ productId: string; quantity: number; price: number; weight?: number }>,
  payments: Array<{ method: string; amount: number }>
) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const total = payments.reduce((acc, p) => acc + p.amount, 0);

    const saleResult = await client.query(
      `INSERT INTO "Sale" ("appUserId", "clientId", total, "paymentMethod", status, "createdAt") 
       VALUES ($1, $2, $3, $4, 'FINALIZADA', NOW()) RETURNING id`,
      [userId, clientId, total, payments[0].method]
    );

    const saleId = saleResult.rows[0].id;

    for (const item of items) {
      await client.query(
        `INSERT INTO "SaleItem" ("saleId", "productId", quantity, price, weight) 
         VALUES ($1, $2, $3, $4, $5)`,
        [saleId, item.productId, item.quantity, item.price, item.weight || null]
      );
    }

    for (const p of payments) {
      await client.query(
        `INSERT INTO "SalePayment" ("saleId", method, amount) 
         VALUES ($1, $2, $3)`,
        [saleId, p.method, p.amount]
      );
    }

    await client.query('COMMIT');
    return { id: saleId, total };
  } catch (err) {
    await client.query('ROLLBACK');
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
