import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(`[ERROR] ${err.message}`, err.stack?.split("\n")[1]?.trim());

  const status = (err as any).status || 500;
  const code = (err as any).code || "INTERNAL_ERROR";

  res.status(status).json({
    error: err.message || "Internal server error",
    code,
  });
}
