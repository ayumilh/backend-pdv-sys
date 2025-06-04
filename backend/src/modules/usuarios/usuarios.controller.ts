import { Request, Response } from 'express';
import { userService } from './usuarios.service';

export const userController = {
    async create(req: Request, res: Response) {
        const { name, email, password, role } = req.body;
        try {
            const user = await userService.create({ name, email, password, role });
            res.status(201).json(user);
            return
        } catch (error: any) {
            res.status(400).json({ error: error.message });
            return
        }
    },

    async update(req: Request, res: Response) {
        const { id } = req.params;
        const { name, email, password, role } = req.body;
        try {
            const user = await userService.update(id, { name, email, password, role });
            res.json(user);
            return
        } catch (error: any) {
            res.status(400).json({ error: error.message });
            return
        }
    },

    
    async getAll(req: Request, res: Response) {
        try {
            const users = await userService.getAll();
            res.json(users);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },



    async getMovimentacoes(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const movimentacoes = await userService.getStockMovements(id);
            res.json(movimentacoes);
            return
        } catch (error: any) {
            res.status(400).json({ error: error.message });
            return
        }
    }
};
