import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "API Mon Vieux Grimoire",
    plannedRoutes: ["/auth/*", "/books/*"],
  });
});

export default router;
