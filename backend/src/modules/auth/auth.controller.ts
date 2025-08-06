import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service.js";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ message: "Usuário registrado com sucesso", user });
  } catch (err: any) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const { user, token, headers, cookies } = await authService.login({ email, password });

    for (const [key, value] of Object.entries(headers)) {
      if (Array.isArray(value)) value.forEach((v) => res.append(key, v));
      else if (value !== undefined) res.setHeader(key, value);
    }

    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Set-Cookie", cookies);

    res.status(200).json({ user, token });
  } catch (err: any) {
    next(err);
  }
};
