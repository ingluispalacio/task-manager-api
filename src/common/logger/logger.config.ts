import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { Params } from "nestjs-pino";

const logsDir = join(process.cwd(), "logs");
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

// Log global por si falla el parseo de JSON
const globalFallbackLogPath = join(logsDir, "combined-fallback.log");

const logLevels: Record<number, string> = {
  10: "trace",
  20: "debug",
  30: "info",
  40: "warn",
  50: "error",
  60: "fatal",
};

const writeLog = (message: string) => {
  try {
    const entry = JSON.parse(message);
    const moduleKey: string = String(entry.module ?? "app");
    const moduleDir = join(logsDir, moduleKey);
    
    if (!existsSync(moduleDir)) {
      mkdirSync(moduleDir, { recursive: true });
    }
    
    // CAMBIO AQUÍ: Ahora el archivo lleva el nombre del módulo: "tasks.log", "auth.log", etc.
    const moduleLogPath = join(moduleDir, `${moduleKey}.log`);
    
    // Escribir en el archivo específico del módulo con su propio nombre
    appendFileSync(moduleLogPath, message);

    const level = logLevels[entry.level] ?? entry.level ?? "info";
    const time = typeof entry.time === "number" ? new Date(entry.time).toISOString() : String(entry.time ?? new Date().toISOString());
    const method = entry.req?.method ? `${entry.req.method}` : "";
    const url = entry.req?.url ? ` ${entry.req.url}` : "";
    const status = entry.res?.statusCode ?? entry.response?.statusCode ?? "";
    const statusText = status ? ` ${status}` : "";
    const moduleName = entry.module ? ` [${entry.module}]` : "";
    const context = entry.context ? ` [${entry.context}]` : "";
    
    process.stdout.write(`[${time}]${moduleName}${context} ${level} ${entry.msg ?? ""}${method}${url}${statusText}\n`);
  } catch (err) {
    try {
      appendFileSync(globalFallbackLogPath, message);
    } catch {}
    process.stdout.write(message);
  }
};


export const loggerModuleConfig: Params = {
  pinoHttp: [
    {
      level: process.env.LOG_LEVEL ?? "info",
      redact: ["req.headers.authorization"],
      customProps: (req) => {
        const path = String(req.url ?? "").split("?")[0];
        if (path.startsWith("/tasks")) {
          return { module: "tasks" };
        }
        if (path.startsWith("/auth")) {
          return { module: "auth" };
        }
        return { module: "app" };
      },
      customLogLevel: (_req, _res, err) => (err ? "error" : "info"),
      customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
      customErrorMessage: (req, res, err) => `${req.method} ${req.url} ${res.statusCode} - ${err?.message ?? "error"}`,
      quietReqLogger: true,
    },
    {
      write: writeLog,
    },
  ],
};