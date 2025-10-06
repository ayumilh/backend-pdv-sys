import pool from "../../../bd.js";

interface FiadoData {
    userId: string;
    clienteId: string;
    saleId: string;
    valorTotal: number;
    observacao?: string;
}

export const registrarFiado = async (data: FiadoData) => {
    const client = await pool.connect();
    try {
        const { clienteId, saleId, valorTotal, observacao } = data;

        const result = await client.query(
            `
      INSERT INTO "Fiado" ("clienteId", "saleId", "valorTotal", "valorPago", "status", "observacao")
      VALUES ($1, $2, $3, 0, 'ABERTO', $4)
      RETURNING *;
      `,
            [clienteId, saleId, valorTotal, observacao || null]
        );

        return result.rows[0];
    } finally {
        client.release();
    }
};

export const listarFiados = async () => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
      SELECT f.*, c.nome AS "clienteNome"
      FROM "Fiado" f
      JOIN "Client" c ON c.id = f."clienteId"
      ORDER BY f."dataCompra" DESC
    `);
        return result.rows;
    } finally {
        client.release();
    }
};

export const listarFiadosCliente = async (clienteId: string) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT * FROM "Fiado" WHERE "clienteId" = $1 ORDER BY "dataCompra" DESC`,
            [clienteId]
        );
        return result.rows;
    } finally {
        client.release();
    }
};

export const pagarFiado = async (
  id: string,
  valorPago: number,
  userRole: string,
  userId: string
) => {
  if (userRole !== "ADMIN") {
    throw new Error("Apenas gerentes podem registrar pagamentos de fiado.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const fiadoRes = await client.query(`SELECT * FROM "Fiado" WHERE id = $1`, [id]);
    if (!fiadoRes.rows.length) throw new Error("Registro de fiado não encontrado.");

    const fiado = fiadoRes.rows[0];
    const novoValorPago = parseFloat(fiado.valorPago) + valorPago;
    const status = novoValorPago >= parseFloat(fiado.valorTotal) ? "PAGO" : "PARCIAL";
    const dataPagamento = status === "PAGO" ? new Date() : null;

    await client.query(
      `UPDATE "Fiado"
       SET "valorPago" = $1, "status" = $2, "dataPagamento" = $3
       WHERE id = $4`,
      [novoValorPago, status, dataPagamento, id]
    );

    // 🔹 Gera transação no caixa
    const caixa = await client.query(
      `SELECT id FROM "CashRegister" WHERE "appUserId" = $1 AND "closedAt" IS NULL`,
      [userId]
    );

    if (caixa.rows.length) {
      const registerId = caixa.rows[0].id;
      await client.query(
        `INSERT INTO "CashTransaction" ("registerId", type, amount, description, "createdAt")
         VALUES ($1, 'VENDA', $2, $3, NOW())`,
        [registerId, valorPago, `Recebimento de fiado (#${fiado.id})`]
      );
    }

    await client.query("COMMIT");
    return { message: "Pagamento de fiado registrado e lançado no caixa.", status };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

