import { PrismaClient, Product, Prisma } from "@prisma/client";

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

// Cria um novo produto
type CreateProductInput = Omit<Prisma.ProductCreateInput, "id" | "createdAt" | "updatedAt">;

export const createProduct = async (data: CreateProductInput): Promise<Product> => {
  if (data.price < 0) {
    throw new Error("Preço inválido");
  }

  if (data.stock < 0) {
    throw new Error("Estoque inválido");
  }

  return prisma.product.create({ data });
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
