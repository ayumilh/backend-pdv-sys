import dotenv from "dotenv";
dotenv.config();
import 'module-alias/register';
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authMiddleware from "./src/middleware/authMiddleware"; // Corrija o caminho conforme necessário
import errorMiddleware from "./src/middleware/errorMiddleware";  // Corrija o caminho conforme necessário

import saleRoutes from "./src/routes/saleRoutes";
import authRoutes from "./src/routes/authRoutes"; // Corrija o caminho conforme necessário
import clientsRoutes from "./src/routes/clientRoutes"; // Corrija o caminho conforme necessário
import userRoutes from "./src/routes/userRoutes"; // Corrija o caminho conforme necessário

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

app.use('/api/userauth', authRoutes, userRoutes);
app.use("/api/sale", authMiddleware, saleRoutes);
app.use("/api/clients", authMiddleware, clientsRoutes);

const PORT = process.env.PORT || 3001;

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
