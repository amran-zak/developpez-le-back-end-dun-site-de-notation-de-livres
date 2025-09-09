import { Router } from "express";
const router = Router();

// Ici on branchera plus tard :
// router.use("/auth", authRouter);     // POST /api/auth/signup, /api/auth/login
// router.use("/books", booksRouter);   // CRUD + ratings

router.get("/", (req, res) => {
  res.json({
    message: "API Mon Vieux Grimoire",
    plannedRoutes: ["/auth/*", "/books/*"],
  });
});

export default router;
