import pool from "../../../bd.js";

interface FornecedorData {
  name: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export const listarFornecedores = async () => {
  const result = await pool.query(`
    SELECT * FROM "Fornecedor"
    ORDER BY "createdAt" DESC
  `);
  return result.rows;
};

export const buscarFornecedorPorId = async (id: string) => {
  const result = await pool.query(
    `SELECT * FROM "Fornecedor" WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

export const criarFornecedor = async (data: FornecedorData) => {
  const { name, cnpj, phone, email, address } = data;

  if (!name) throw new Error("O nome do fornecedor é obrigatório.");

  const result = await pool.query(
    `
    INSERT INTO "Fornecedor" (name, cnpj, phone, email, address, "createdAt")
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING *;
    `,
    [name, cnpj || null, phone || null, email || null, address || null]
  );

  return result.rows[0];
};

export const atualizarFornecedor = async (
  id: string,
  data: Partial<FornecedorData>
) => {
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(data).forEach(([key, value], index) => {
    fields.push(`"${key}" = $${index + 1}`);
    values.push(value);
  });

  if (!fields.length) throw new Error("Nenhum campo para atualizar.");

  values.push(id);

  const result = await pool.query(
    `
    UPDATE "Fornecedor"
    SET ${fields.join(", ")}, "createdAt" = "createdAt"
    WHERE id = $${values.length}
    RETURNING *;
    `,
    values
  );

  return result.rows[0];
};

export const deletarFornecedor = async (id: string) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Verifica se o fornecedor existe
    const fornecedorRes = await client.query(
      `SELECT * FROM "Fornecedor" WHERE id = $1`,
      [id]
    );
    if (!fornecedorRes.rows.length)
      throw new Error("Fornecedor não encontrado.");

    // Verifica se há pedidos de compra vinculados
    const pedidosRes = await client.query(
      `SELECT COUNT(*) FROM "PedidoCompra" WHERE "fornecedorId" = $1`,
      [id]
    );

    if (parseInt(pedidosRes.rows[0].count) > 0) {
      throw new Error(
        "Não é possível excluir este fornecedor pois há pedidos vinculados."
      );
    }

    await client.query(`DELETE FROM "Fornecedor" WHERE id = $1`, [id]);
    await client.query("COMMIT");

    return { message: "Fornecedor excluído com sucesso." };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
