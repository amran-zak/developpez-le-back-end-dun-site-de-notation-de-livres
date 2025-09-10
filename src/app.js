import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/index.js";
import healthRoute from "./routes/health.js";
import booksRoutes from "./routes/books.routes.js";
import authRoutes from "./routes/auth.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan("dev"));

// Static images
app.use("/images", express.static(path.join(__dirname, "../images")));

app.use("/api", routes);
app.use("/api/health", healthRoute);
app.use("/api/auth", authRoutes);
app.use("/api/books", booksRoutes);

app.use((req, res) => res.status(404).json({ message: "Route non trouvée" }));
app.use((err, req, res, next) => {
  console.error("❌", err);
  res.status(500).json({ message: err.message || "Erreur serveur" });
});

export default app;
