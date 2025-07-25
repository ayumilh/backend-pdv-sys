import dotenv from "dotenv";
dotenv.config();
import 'module-alias/register';
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./src/modules/auth/auth.routes";
import usuariosRoutes from "./src/modules/usuarios/usuarios.routes";
import userRoutes from "./src/modules/user/user.routes";
import productsRoutes from "./src/modules/product/product.routes";
import categorysRoutes from "./src/modules/category/category.routes";
import stockRoutes from "./src/modules/stock/stock.routes";
import cashRoutes from "./src/modules/cash/cash.routes";

import { errorMiddleware } from "./src/shared/middleware/errorMiddleware";

const app = express();

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "https://interface-pdv-sys.vercel.app", 
      "http://localhost:3000"
    ],
    credentials: true,
  })
);
app.options("*", cors());

// Rota 
app.get("/", (req: Request, res: Response) => {
  res.send("Bem-vindo à página principal");
});

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categorysRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/cash", cashRoutes);
app.use('/api/userauth', authRoutes, userRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3001;


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
