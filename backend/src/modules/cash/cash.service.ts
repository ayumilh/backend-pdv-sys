import { prisma } from '../../../prisma/prismaClient';
import { CashTransactionType, PaymentMethod, SaleStatus } from '@prisma/client';

export const abrirCaixa = async (userId: string, openingAmount: number) => {
  return prisma.cashRegister.create({
    data: {
      userId,
      openingAmount,
      openedAt: new Date(),
      transactions: {
        create: {
          type: CashTransactionType.ABERTURA,
          amount: openingAmount,
          description: 'Abertura de caixa',
        },
      },
    },
  });
};

export const fecharCaixa = async (registerId: string, closingAmount: number) => {
  return prisma.cashRegister.update({
    where: { id: registerId },
    data: {
      closedAt: new Date(),
      closingAmount,
      transactions: {
        create: {
          type: CashTransactionType.FECHAMENTO,
          amount: closingAmount,
          description: 'Fechamento de caixa',
        },
      },
    },
  });
};

export const registrarVenda = async (
  userId: string,
  clientId: string | null,
  items: Array<{ productId: string; quantity: number; price: number; weight?: number }>,
  payments: Array<{ method: PaymentMethod; amount: number }>
) => {
  const total = payments.reduce((acc, p) => acc + p.amount, 0);

  return prisma.sale.create({
    data: {
      userId,
      clientId,
      total,
      paymentMethod: payments[0].method, // compatibilidade com campo antigo
      status: SaleStatus.FINALIZADA,
      items: {
        create: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          weight: item.weight,
        })),
      },
      SalePayment: {
        create: payments,
      },
    },
  });
};

export const registrarTransacao = async (
  registerId: string,
  type: CashTransactionType,
  amount: number,
  description?: string
) => {
  return prisma.cashTransaction.create({
    data: {
      registerId,
      type,
      amount,
      description,
    },
  });
};

export const getResumoCaixa = async (registerId: string) => {
  const transacoes = await prisma.cashTransaction.findMany({
    where: { registerId },
  });

  const resumo = transacoes.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  return resumo;
};
