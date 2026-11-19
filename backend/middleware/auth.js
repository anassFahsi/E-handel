import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export function auth(req, res, next) {

  const token = req.cookies.token;

  if (!token) {
    
    return res.status(401).json({
      error: "No token provided"
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;
    next();

  } catch (error) {
    console.log("INVALID TOKEN");

    return res.status(401).json({
      error: "Invalid token"
    });
  }
}
