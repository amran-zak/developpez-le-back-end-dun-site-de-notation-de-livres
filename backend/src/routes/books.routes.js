import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import { uploadSingleImage } from "../middleware/multer-config.js";
import { processAndSaveImage } from "../middleware/image-processor.js";
import {
  getAllBooks,
  getBookById,
  getBestRated,
  createBook,
  updateBook,
  deleteBook,
  rateBook,
} from "../controllers/books.controller.js";

const router = Router();

// publiques
router.get("/", getAllBooks);
router.get("/bestrating", getBestRated);
router.get("/:id", getBookById);

// protégées
router.post("/", authRequired, uploadSingleImage, processAndSaveImage, createBook);
router.put("/:id", authRequired, uploadSingleImage, processAndSaveImage, updateBook);
router.delete("/:id", authRequired, deleteBook);
router.post("/:id/rating", authRequired, rateBook);

export default router;
