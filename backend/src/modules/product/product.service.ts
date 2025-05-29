import { PrismaClient, Product, Prisma, StockMovementType } from "@prisma/client";

const prisma = new PrismaClient();

// Lista todos os produtos com filtros opcionais
export const listProducts = async (categoryId?: string, search?: string): Promise<Product[]> => {
  return prisma.product.findMany({
    where: {
      AND: [
        categoryId ? { categoryId } : {},
        search
          ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { barcode: { contains: search, mode: "insensitive" } },
            ],
          }
          : {},
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
    },
  });
};

// Busca produto por ID
export const getProductById = async (id: string): Promise<Product | null> => {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
};

// Adiciona userId no tipo de input
type CreateProductInput = Omit<Prisma.ProductCreateInput, "id" | "createdAt" | "updatedAt"> & {
  userId: string;
};

export const createProduct = async (data: CreateProductInput): Promise<Product> => {
  if (data.price < 0) throw new Error("Preço inválido");
  if (data.stock < 0) throw new Error("Estoque inválido");

  // Criação do produto
  const product = await prisma.product.create({
    data: {
      name: data.name,
      price: data.price,
      stock: data.stock,
      barcode: data.barcode,
      imageUrl: data.imageUrl,
      weight: data.weight,
    },
  });

  // Se estoque > 0, registra movimento
  if (data.stock > 0) {
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        quantity: data.stock,
        type: StockMovementType.ENTRADA,
        userId: data.userId,
      },
    });
  }

  return product;
};


// Atualiza um produto
export const updateProduct = async (
  id: string,
  data: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>
): Promise<Product> => {
  if (data.price !== undefined && data.price < 0) {
    throw new Error("Preço inválido");
  }

  if (data.stock !== undefined && data.stock < 0) {
    throw new Error("Estoque inválido");
  }

  return prisma.product.update({
    where: { id },
    data,
  });
};


export const deleteProduct = async (id: string): Promise<boolean> => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return false;

  // Exclui todas as movimentações de estoque relacionadas
  await prisma.stockMovement.deleteMany({
    where: { productId: id },
  });

  // Agora pode deletar o produto com segurança
  await prisma.product.delete({ where: { id } });

  return true;
};

