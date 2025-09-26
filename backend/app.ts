import 'dotenv/config';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./src/modules/auth/auth.routes.js";
import usuariosRoutes from "./src/modules/usuarios/usuarios.routes.js";
import userRoutes from "./src/modules/user/user.routes.js";
import productsRoutes from "./src/modules/product/product.routes.js";
import categorysRoutes from "./src/modules/category/category.routes.js";
import stockRoutes from "./src/modules/stock/stock.routes.js";
import cashRoutes from "./src/modules/cash/cash.routes.js";

import { errorMiddleware } from "./src/shared/middleware/errorMiddleware.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "https://pdv.realeza.company", 
      "http://localhost:3000"
    ],
    credentials: true,
  })
);
app.options("*", cors());

// Rota 
app.get('/', (_, res) => {
  res.send('API is running!');
});


app.use("/usuarios", usuariosRoutes);
app.use("/products", productsRoutes);
app.use("/categories", categorysRoutes);
app.use("/stock", stockRoutes);
app.use("/cash", cashRoutes);
app.use('/userauth', authRoutes, userRoutes);

app.use(errorMiddleware);

export default app;
