import pool from "../../../bd.js";

interface FiltrosVendas {
  dataInicio?: string;
  dataFim?: string;
  userId?: string;
  productId?: string;
}

interface FiltrosCompras {
  dataInicio?: string;
  dataFim?: string;
  fornecedorId?: string;
}

// ✅ Relatório de Vendas
export const relatoriosVendas = async (filtros: FiltrosVendas) => {
  const params: any[] = [];
  const condicoes: string[] = [];

  if (filtros.dataInicio) {
    params.push(filtros.dataInicio);
    condicoes.push(`s."createdAt" >= $${params.length}`);
  }
  if (filtros.dataFim) {
    params.push(filtros.dataFim);
    condicoes.push(`s."createdAt" <= $${params.length}`);
  }
  if (filtros.userId) {
    params.push(filtros.userId);
    condicoes.push(`s."appUserId" = $${params.length}`);
  }
  if (filtros.productId) {
    params.push(filtros.productId);
    condicoes.push(`si."productId" = $${params.length}`);
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";

  const result = await pool.query(
    `
    SELECT
      s.id AS "saleId",
      s."createdAt",
      s."total",
      s."paymentMethod",
      u.username AS "vendedor",
      p.name AS "produto",
      si.quantity,
      si.price,
      (si.quantity * si.price) AS "subtotal"
    FROM "Sale" s
    JOIN "SaleItem" si ON si."saleId" = s.id
    JOIN "Product" p ON p.id = si."productId"
    LEFT JOIN "AppUser" u ON u.id = s."appUserId"
    ${where}
    ORDER BY s."createdAt" DESC;
    `,
    params
  );

  // Totalizador
  const total = result.rows.reduce((acc, r) => acc + Number(r.subtotal), 0);
  return { totalGeral: total, quantidade: result.rows.length, vendas: result.rows };
};

// ✅ Relatório de Estoque
export const relatoriosEstoque = async () => {
  const result = await pool.query(`
    SELECT
      p.id,
      p.name,
      p.stock,
      p."costPrice",
      p."salePrice",
      (p.stock * p."costPrice") AS "valorEstoque",
      COALESCE(SUM(sm.quantity) FILTER (WHERE sm.type = 'ENTRADA'), 0) AS "entradas",
      COALESCE(SUM(sm.quantity) FILTER (WHERE sm.type = 'SAIDA'), 0) AS "saidas"
    FROM "Product" p
    LEFT JOIN "StockMovement" sm ON sm."productId" = p.id
    GROUP BY p.id
    ORDER BY p.name ASC;
  `);

  const totalEstoque = result.rows.reduce(
    (acc, r) => acc + Number(r.valorEstoque || 0),
    0
  );
  return { totalEstoque, produtos: result.rows };
};

// ✅ Relatório de Compras
export const relatoriosCompras = async (filtros: FiltrosCompras) => {
  const params: any[] = [];
  const condicoes: string[] = [];

  if (filtros.dataInicio) {
    params.push(filtros.dataInicio);
    condicoes.push(`pc."createdAt" >= $${params.length}`);
  }
  if (filtros.dataFim) {
    params.push(filtros.dataFim);
    condicoes.push(`pc."createdAt" <= $${params.length}`);
  }
  if (filtros.fornecedorId) {
    params.push(filtros.fornecedorId);
    condicoes.push(`pc."fornecedorId" = $${params.length}`);
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";

  const result = await pool.query(
    `
    SELECT
      pc.id AS "pedidoId",
      pc."numeroNota",
      pc."valorTotal",
      pc.status,
      pc."createdAt",
      f.name AS "fornecedor",
      p.name AS "produto",
      ic.quantity,
      ic."unitCost",
      (ic.quantity * ic."unitCost") AS "subtotal"
    FROM "PedidoCompra" pc
    JOIN "ItemCompra" ic ON ic."pedidoCompraId" = pc.id
    JOIN "Product" p ON p.id = ic."productId"
    LEFT JOIN "Fornecedor" f ON f.id = pc."fornecedorId"
    ${where}
    ORDER BY pc."createdAt" DESC;
    `,
    params
  );

  const total = result.rows.reduce((acc, r) => acc + Number(r.subtotal), 0);
  return { totalCompras: total, compras: result.rows };
};

// ✅ Relatório de Fornecedores
export const relatoriosFornecedores = async () => {
  const result = await pool.query(`
    SELECT
      f.id,
      f.name,
      COUNT(pc.id) AS "totalPedidos",
      COALESCE(SUM(pc."valorTotal"), 0) AS "valorTotalComprado",
      MAX(pc."createdAt") AS "ultimaCompra"
    FROM "Fornecedor" f
    LEFT JOIN "PedidoCompra" pc ON pc."fornecedorId" = f.id
    GROUP BY f.id
    ORDER BY "valorTotalComprado" DESC;
  `);
  return result.rows;
};
