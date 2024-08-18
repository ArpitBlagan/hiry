import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
export const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
  jwt.verify(token, process.env.SECRET as string, (err: any, val: any) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: "invalid token login again" });
    }
    req.user = val.user;
    next();
  });
};
