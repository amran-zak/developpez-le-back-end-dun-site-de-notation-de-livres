import "dotenv/config";
import app from "./app.js";
import { connectToDatabase } from "./config/db.js";

const PORT = process.env.PORT || 4000;
const URI  = process.env.MONGODB_URI;

async function main() {
  try {
    if (!URI) throw new Error("MONGODB_URI manquant dans .env");
    await connectToDatabase(URI);
    app.listen(PORT, () => {
      console.log(`🚀 Server prêt sur http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Échec au démarrage :", err);
    process.exit(1);
  }
}

main();
