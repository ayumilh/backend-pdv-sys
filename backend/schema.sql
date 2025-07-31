
-- Enums
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CAIXA', 'ESTOQUISTA');
CREATE TYPE "StockMovementType" AS ENUM ('ENTRADA', 'SAIDA', 'AJUSTE', 'VENDA');
CREATE TYPE "SaleStatus" AS ENUM ('EM_ANDAMENTO', 'FINALIZADA', 'CANCELADA');
CREATE TYPE "PaymentMethod" AS ENUM ('DINHEIRO', 'PIX', 'CARTAO');
CREATE TYPE "CashTransactionType" AS ENUM ('ABERTURA', 'FECHAMENTO', 'VENDA', 'SANGRIA', 'SUPRIMENTO');

-- AppUser
CREATE TABLE "AppUser" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT UNIQUE NOT NULL,
  role "UserRole" NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- 
ALTER TABLE "AppUser"
ADD CONSTRAINT fk_appuser_user
FOREIGN KEY ("userId") REFERENCES "user"(id)
ON DELETE CASCADE;


-- Category
CREATE TABLE "Category" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Product
CREATE TABLE "Product" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  barcode TEXT UNIQUE,
  price FLOAT NOT NULL,
  "imageUrl" TEXT,
  stock INTEGER NOT NULL,
  weight FLOAT,
  "categoryId" UUID,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_product_category FOREIGN KEY ("categoryId") REFERENCES "Category"(id)
);

-- Scale
CREATE TABLE "Scale" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Weighing
CREATE TABLE "Weighing" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "scaleId" UUID NOT NULL,
  "productId" UUID NOT NULL,
  weight FLOAT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_weighing_scale FOREIGN KEY ("scaleId") REFERENCES "Scale"(id),
  CONSTRAINT fk_weighing_product FOREIGN KEY ("productId") REFERENCES "Product"(id)
);

-- StockMovement
CREATE TABLE "StockMovement" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId" UUID NOT NULL,
  type "StockMovementType" NOT NULL,
  quantity INTEGER NOT NULL,
  "appUserId" UUID,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_stock_product FOREIGN KEY ("productId") REFERENCES "Product"(id),
  CONSTRAINT fk_stock_user FOREIGN KEY ("appUserId") REFERENCES "AppUser"(id)
);

-- Client
CREATE TABLE "Client" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cpf TEXT UNIQUE,
  phone TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- LoyaltyPoint
CREATE TABLE "LoyaltyPoint" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientId" UUID NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_loyalty_client FOREIGN KEY ("clientId") REFERENCES "Client"(id)
);

-- Sale
CREATE TABLE "Sale" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientId" UUID,
  "appUserId" UUID NOT NULL,
  total FLOAT NOT NULL,
  "paymentMethod" "PaymentMethod" NOT NULL,
  status "SaleStatus" DEFAULT 'FINALIZADA',
  synced BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_sale_client FOREIGN KEY ("clientId") REFERENCES "Client"(id),
  CONSTRAINT fk_sale_user FOREIGN KEY ("appUserId") REFERENCES "AppUser"(id)
);

-- SaleItem
CREATE TABLE "SaleItem" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "saleId" UUID NOT NULL,
  "productId" UUID NOT NULL,
  quantity INTEGER NOT NULL,
  price FLOAT NOT NULL,
  weight FLOAT,
  "weighingId" UUID,
  CONSTRAINT fk_saleitem_sale FOREIGN KEY ("saleId") REFERENCES "Sale"(id),
  CONSTRAINT fk_saleitem_product FOREIGN KEY ("productId") REFERENCES "Product"(id),
  CONSTRAINT fk_saleitem_weighing FOREIGN KEY ("weighingId") REFERENCES "Weighing"(id)
);

-- SalePayment
CREATE TABLE "SalePayment" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "saleId" UUID NOT NULL,
  method "PaymentMethod" NOT NULL,
  amount FLOAT NOT NULL,
  CONSTRAINT fk_salepayment_sale FOREIGN KEY ("saleId") REFERENCES "Sale"(id)
);

-- FiscalDocument
CREATE TABLE "FiscalDocument" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "saleId" UUID UNIQUE NOT NULL,
  status TEXT NOT NULL,
  "receiptUrl" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_fiscal_sale FOREIGN KEY ("saleId") REFERENCES "Sale"(id)
);

-- CashRegister
CREATE TABLE "CashRegister" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "appUserId" UUID NOT NULL,
  "openedAt" TIMESTAMP NOT NULL,
  "closedAt" TIMESTAMP,
  "openingAmount" FLOAT NOT NULL,
  "closingAmount" FLOAT,
  CONSTRAINT fk_cashregister_user FOREIGN KEY ("appUserId") REFERENCES "AppUser"(id)
);

-- CashTransaction
CREATE TABLE "CashTransaction" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type "CashTransactionType" NOT NULL,
  amount FLOAT NOT NULL,
  description TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "registerId" UUID NOT NULL,
  CONSTRAINT fk_cashtransaction_register FOREIGN KEY ("registerId") REFERENCES "CashRegister"(id)
);
