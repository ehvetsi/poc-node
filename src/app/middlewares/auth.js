import jwt from "jsonwebtoken";
import { promisify } from "util";
import config from "../../config/auth";

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ erro: "Token not found" });
  }

  const [, token] = authHeader.split(" ");
  try {
    const decoded = await promisify(jwt.verify)(token, config.secret);
    req.userId = decoded.id;
    console.log(decoded);
    next();
  } catch (error) {
    return res.status(401).json({ erro: "Token not invalid" });
  }
  return next();
};
