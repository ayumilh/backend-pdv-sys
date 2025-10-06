-- =======================================================
-- 🧩 ENUMS
-- =======================================================
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CAIXA', 'ESTOQUISTA');
CREATE TYPE "StockMovementType" AS ENUM ('ENTRADA', 'SAIDA', 'AJUSTE', 'VENDA');
CREATE TYPE "SaleStatus" AS ENUM ('EM_ANDAMENTO', 'FINALIZADA', 'CANCELADA');
CREATE TYPE "PaymentMethod" AS ENUM ('DINHEIRO', 'PIX', 'CARTAO');
CREATE TYPE "CashTransactionType" AS ENUM ('ABERTURA', 'FECHAMENTO', 'VENDA', 'SANGRIA', 'SUPRIMENTO');

-- =======================================================
-- 🧩 AppUser
-- =======================================================
CREATE TABLE "AppUser" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,  -- nome de usuário interno
  password TEXT NOT NULL,          -- senha (criptografada)
  role "UserRole" NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =======================================================
-- 🧩 Category
-- =======================================================
CREATE TABLE "Category" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =======================================================
-- 🧩 Product
-- =======================================================
CREATE TABLE "Product" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  barcode TEXT UNIQUE,
  price NUMERIC(10,2) NOT NULL,
  "imageUrl" TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  weight NUMERIC(10,2),
  "categoryId" UUID REFERENCES "Category"(id) ON DELETE SET NULL,
  "costPrice" NUMERIC(10,2) DEFAULT 0,
  "unit" VARCHAR(20) DEFAULT 'UN',
  "minStock" INTEGER DEFAULT 0,
  "sku" TEXT UNIQUE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =======================================================
-- 🧩 Scale
-- =======================================================
CREATE TABLE "Scale" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =======================================================
-- 🧩 Weighing
-- =======================================================
CREATE TABLE "Weighing" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "scaleId" UUID NOT NULL REFERENCES "Scale"(id) ON DELETE CASCADE,
  "productId" UUID NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
  weight NUMERIC(10,2) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- =======================================================
-- 🧩 StockMovement
-- =======================================================
CREATE TABLE "StockMovement" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId" UUID NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
  type "StockMovementType" NOT NULL,
  quantity INTEGER NOT NULL,
  "appUserId" UUID REFERENCES "AppUser"(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- =======================================================
-- 🧩 Client
-- =======================================================
CREATE TABLE "Client" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cpf TEXT UNIQUE,
  phone TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =======================================================
-- 🧩 LoyaltyPoint
-- =======================================================
CREATE TABLE "LoyaltyPoint" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientId" UUID NOT NULL REFERENCES "Client"(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- =======================================================
-- 🧩 Sale
-- =======================================================
CREATE TABLE "Sale" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientId" UUID REFERENCES "Client"(id) ON DELETE SET NULL,
  "appUserId" UUID NOT NULL REFERENCES "AppUser"(id) ON DELETE SET NULL,
  total NUMERIC(10,2) NOT NULL,
  "paymentMethod" "PaymentMethod" NOT NULL,
  status "SaleStatus" DEFAULT 'FINALIZADA',
  synced BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- =======================================================
-- 🧩 SaleItem
-- =======================================================
CREATE TABLE "SaleItem" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "saleId" UUID NOT NULL REFERENCES "Sale"(id) ON DELETE CASCADE,
  "productId" UUID NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  weight NUMERIC(10,2),
  "weighingId" UUID REFERENCES "Weighing"(id) ON DELETE SET NULL
);


ALTER TABLE "SaleItem"
ADD COLUMN "loteId" UUID REFERENCES "LoteProduto"(id) ON DELETE SET NULL;


-- =======================================================
-- 🧩 SalePayment
-- =======================================================
CREATE TABLE "SalePayment" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "saleId" UUID NOT NULL REFERENCES "Sale"(id) ON DELETE CASCADE,
  method "PaymentMethod" NOT NULL,
  amount NUMERIC(10,2) NOT NULL
);

-- =======================================================
-- 🧩 FiscalDocument
-- =======================================================
CREATE TABLE "FiscalDocument" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "saleId" UUID UNIQUE NOT NULL REFERENCES "Sale"(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  "receiptUrl" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- =======================================================
-- 🧩 CashRegister
-- =======================================================
CREATE TABLE "CashRegister" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "appUserId" UUID NOT NULL REFERENCES "AppUser"(id) ON DELETE SET NULL,
  "openedAt" TIMESTAMP NOT NULL,
  "closedAt" TIMESTAMP,
  "openingAmount" NUMERIC(10,2) NOT NULL,
  "closingAmount" NUMERIC(10,2)
);

-- =======================================================
-- 🧩 CashTransaction
-- =======================================================
CREATE TABLE "CashTransaction" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type "CashTransactionType" NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "registerId" UUID NOT NULL REFERENCES "CashRegister"(id) ON DELETE CASCADE
);

-- =======================================================
-- 🧩 Fornecedor
-- =======================================================
CREATE TABLE "Fornecedor" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  phone TEXT,
  email TEXT,
  address TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- =======================================================
-- 🧩 PedidoCompra
-- =======================================================
CREATE TABLE "PedidoCompra" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "fornecedorId" UUID NOT NULL REFERENCES "Fornecedor"(id) ON DELETE CASCADE,
  "appUserId" UUID REFERENCES "AppUser"(id) ON DELETE SET NULL,
  valorTotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  "numeroNota" TEXT,
  status TEXT DEFAULT 'FINALIZADA',
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- =======================================================
-- 🧩 LoteProduto
-- =======================================================
CREATE TABLE "LoteProduto" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId" UUID NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
  "batchNumber" TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  "expirationDate" DATE,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- =======================================================
-- 🧩 ItemCompra
-- =======================================================
CREATE TABLE "ItemCompra" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "pedidoCompraId" UUID NOT NULL REFERENCES "PedidoCompra"(id) ON DELETE CASCADE,
  "productId" UUID NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  "unitCost" NUMERIC(10,2) NOT NULL,
  "totalCost" NUMERIC(10,2) GENERATED ALWAYS AS (quantity * "unitCost") STORED
);
