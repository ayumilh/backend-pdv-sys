import { Router } from "express";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createMovementForProduct,
  getMovementsByProduct
} from "./product.controller.js";
import { authMiddleware } from '../../shared/middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get("/", listProducts);

router.get("/:id", getProduct);

router.post("/", createProduct);

router.put("/:id", updateProduct);

router.delete("/:id", deleteProduct);

router.post('/:id/stock', createMovementForProduct);

router.get('/:id/stock', getMovementsByProduct);

export default router;
