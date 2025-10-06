import { Request, Response, NextFunction } from 'express';
import * as fiadoService from './fiado.service.js';

interface UsuarioDecoded {
    id: string;
    name: string;
    email?: string;
    role: string;
}

export const registrarFiado = async (
    req: Request & { usuario?: UsuarioDecoded },
    res: Response,
    next: NextFunction
) => {
    try {
        const { clienteId, saleId, valorTotal, observacao } = req.body;
        const userId = req.usuario?.id;

        if (!userId || !clienteId || !saleId || !valorTotal) {
            res.status(400).json({ message: 'Dados inválidos para registro de fiado.' });
            return;
        }

        const fiado = await fiadoService.registrarFiado({
            userId,
            clienteId,
            saleId,
            valorTotal,
            observacao
        });

        res.status(201).json(fiado);
    } catch (err) {
        next(err);
    }
};

export const listarFiados = async (
    req: Request & { usuario?: UsuarioDecoded },
    res: Response,
    next: NextFunction
) => {
    try {
        const fiados = await fiadoService.listarFiados();
        res.status(200).json(fiados);
    } catch (err) {
        next(err);
    }
};

export const listarFiadosCliente = async (
    req: Request & { usuario?: UsuarioDecoded },
    res: Response,
    next: NextFunction
) => {
    try {
        const { clienteId } = req.params;
        if (!clienteId) {
            res.status(400).json({ message: 'Cliente inválido.' });
            return;
        }

        const fiados = await fiadoService.listarFiadosCliente(clienteId);
        res.status(200).json(fiados);
    } catch (err) {
        next(err);
    }
};

export const pagarFiado = async (
    req: Request & { usuario?: UsuarioDecoded },
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { valorPago } = req.body;
        const userRole = req.usuario?.role;
        const userId = req.usuario?.id;

        if (!userRole || !userId) {
            res.status(401).json({ message: 'Usuário não autenticado.' });
            return;
        }

        if (!id || !valorPago) {
            res.status(400).json({ message: 'Dados inválidos para pagamento de fiado.' });
            return;
        }

        const result = await fiadoService.pagarFiado(id, valorPago, userRole, userId);
        res.status(200).json(result);
        
    } catch (err) {
        next(err);
    }
}