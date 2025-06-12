import { Request, Response, NextFunction } from 'express';
import { userService } from './usuarios.service';

interface UsuarioDecoded {
    id: string;
    name: string;
    email?: string;
    role: string;
}

export const userController = {
    async create(
        req: Request & { usuario?: UsuarioDecoded },
        res: Response,
        next: NextFunction
    ) {
        try {
            const usuario = req.usuario;

            if (!usuario || usuario.role !== 'ADMIN') {
                res.status(403).json({ message: 'Apenas administradores podem criar usuários.' });
                return;
            }

            const { name, email, password, role } = req.body;
            const user = await userService.create({ name, email, password, role });
            res.status(201).json(user);
            return;
        } catch (error) {
            next(error);
        }
    },

    async update(
        req: Request & { usuario?: UsuarioDecoded },
        res: Response,
        next: NextFunction
    ) {
        try {
            const usuario = req.usuario;

            if (!usuario || usuario.role !== 'ADMIN') {
                res.status(403).json({ message: 'Apenas administradores podem editar usuários.' });
                return;
            }

            const { id } = req.params;
            const { name, email, password, role } = req.body;
            const user = await userService.update(id, { name, email, password, role });
            res.json(user);
            return;
        } catch (error) {
            next(error);
        }
    },

    async getAll(
        req: Request & { usuario?: UsuarioDecoded },
        res: Response,
        next: NextFunction
    ) {
        try {
            const usuario = req.usuario;

            if (!usuario || usuario.role !== 'ADMIN') {
                res.status(403).json({ message: 'Apenas administradores podem visualizar usuários.' });
                return;
            }

            const users = await userService.getAll();
            res.json(users);
            return;
        } catch (error) {
            next(error);
        }
    },

    async getById(
        req: Request & { usuario?: UsuarioDecoded },
        res: Response,
        next: NextFunction
    ) {
        try {
            const { id } = req.params;

            const usuario = req.usuario;
            if (!usuario || usuario.role !== 'ADMIN') {
                res.status(403).json({ message: 'Apenas administradores podem visualizar dados de usuários.' });
                return;
            }

            const user = await userService.getById(id);

            if (!user) {
                res.status(404).json({ message: 'Usuário não encontrado.' });
                return;
            }

            res.json(user);
            return;
        } catch (error) {
            next(error);
        }
    },


    async getMovimentacoes(
        req: Request & { usuario?: UsuarioDecoded },
        res: Response,
        next: NextFunction
    ) {
        try {
            const usuario = req.usuario;
            const { id } = req.params;

            if (!usuario || usuario.role !== 'ADMIN') {
                res.status(403).json({ message: 'Apenas administradores podem visualizar movimentações.' });
                return;
            }

            const movimentacoes = await userService.getStockMovements(id);
            res.json(movimentacoes);
            return;
        } catch (error) {
            next(error);
        }
    },

    async delete(
        req: Request & { usuario?: UsuarioDecoded },
        res: Response,
        next: NextFunction
    ) {
        try {
            const usuario = req.usuario;
            const { id } = req.params;

            if (!usuario || usuario.role !== 'ADMIN') {
                res.status(403).json({ message: 'Apenas administradores podem deletar usuários.' });
                return;
            }

            const userToDelete = await userService.getById(id);

            if (!userToDelete) {
                res.status(404).json({ message: 'Usuário não encontrado.' });
                return;
            }

            if (userToDelete.role === 'ADMIN') {
                res.status(403).json({ message: 'Você não pode deletar um administrador.' });
                return;
            }

            await userService.delete(id);
            res.status(204).send();
            return;
        } catch (error) {
            next(error);
        }
    },

    checkEmailExists: async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'E-mail inválido' });
      return;
    }

    try {
      const exists = await userService.emailExists(email);
      res.status(200).json({ exists });
      return;
    } catch (error) {
      console.error('Erro ao verificar e-mail:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
      return;
    }
  }

};
