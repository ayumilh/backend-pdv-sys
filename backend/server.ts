import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./src/modules/auth/auth.routes.js";
import usuariosRoutes from "./src/modules/usuarios/usuarios.routes.js";
import fiadoRoutes from './src/modules/fiado/fiado.routes.js';
import userRoutes from "./src/modules/user/user.routes.js";
import productsRoutes from "./src/modules/product/product.routes.js";
import categorysRoutes from "./src/modules/category/category.routes.js";
import stockRoutes from "./src/modules/stock/stock.routes.js";
import cashRoutes from "./src/modules/cash/cash.routes.js";
import loteProdutoRoutes from "./src/modules/loteProduto/loteProduto.routes.js";
import fornecedorRoutes from "./src/modules/fornecedor/fornecedor.routes.js";
import relatoriosRoutes from "./src/modules/relatorios/relatorios.routes.js";

import { errorMiddleware } from "./src/shared/middleware/errorMiddleware.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "https://interface-pdv-sys.vercel.app",
      "http://localhost:3000",
      "https://pdv.realeza.company"
    ],
    credentials: true,
  })
);
app.options("*", cors());

// Rota 
app.get("/", (req: Request, res: Response) => {
  res.send("Bem-vindo à página principal");
});

app.use("/usuarios", usuariosRoutes);
app.use("/products", productsRoutes);
app.use("/categories", categorysRoutes);
app.use("/stock", stockRoutes);
app.use("/cash", cashRoutes);
app.use('/userauth', authRoutes, userRoutes);
app.use('/fiado', fiadoRoutes);
app.use('/fornecedor', fornecedorRoutes);
app.use('/loteProduto', loteProdutoRoutes);
app.use("/relatorios", relatoriosRoutes);


app.use(errorMiddleware);

const PORT = process.env.PORT;


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
