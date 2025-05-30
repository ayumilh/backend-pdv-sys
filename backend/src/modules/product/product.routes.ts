import { Router } from "express";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from "./product.controller";
import { authMiddleware } from '../../shared/middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get("/", listProducts);

router.get("/:id", getProduct);

router.post("/", createProduct);

router.put("/:id", updateProduct);

router.delete("/:id", deleteProduct);

export default router;
