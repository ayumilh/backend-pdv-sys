import express from "express";
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient
} from "@/controllers/clientController";
import { authorizeRoles } from "@/middleware/authorizeRoles";
import { UserRole } from "@prisma/client";

const router = express.Router();


// Rotas
router.post("/", authorizeRoles(UserRole.ADMIN, UserRole.CAIXA), createClient);
router.get("/", authorizeRoles(UserRole.ADMIN, UserRole.CAIXA), getAllClients);
router.get("/:id", authorizeRoles(UserRole.ADMIN, UserRole.CAIXA), getClientById);
router.put("/:id", authorizeRoles(UserRole.ADMIN), updateClient);
router.delete("/:id", authorizeRoles(UserRole.ADMIN), deleteClient);

export default router;
