import { Router } from "express";
import * as productController from "../controllers/productController";

const router = Router();

router.get("/", productController.listProducts);
// router.get("/:id", productController.getProduct);
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);

export default router;
