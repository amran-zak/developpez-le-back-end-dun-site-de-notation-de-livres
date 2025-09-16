import jwt from "jsonwebtoken";

export function authRequired(req, res, next) {
  try {
    const hdr = req.headers.authorization || "";
    const [type, token] = hdr.split(" ");
    if (type !== "Bearer" || !token) throw new Error("Missing token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = { userId: decoded.userId };
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
}
