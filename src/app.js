import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import routes from "./routes/index.js";
import healthRoute from "./routes/health.js";

const app = express();

// Middlewares globaux
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));      // Green-ish: limite raisonnable
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan("dev"));

// Routes
app.use("/api/health", healthRoute); // ping de supervision
app.use("/api", routes);              // point d’entrée API (auth, books viendront ici)

// 404
app.use((req, res, next) => {
  res.status(404).json({ message: "Route non trouvée" });
});

// Handler d’erreurs
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("❌", err);
  res.status(err.status || 500).json({ message: err.message || "Erreur serveur" });
});

export default app;
