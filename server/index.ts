import express from "express";
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Enhanced middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // Changed to true for nested objects

// Improved request logger
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, path } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      const logLine = [
        method, path, 
        res.statusCode, 
        `${duration}ms`,
        res.get("Content-Length") || "0", "bytes"
      ].join(" ");
      
      log(logLine);
    }
  });

  next();
});

// Error handling wrapper
async function startServer() {
  try {
    const server = await registerRoutes(app);

    // Enhanced error handler
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      const status = err.status || 500;
      const message = status >= 500 ? "Internal Server Error" : err.message;
      
      if (status >= 500) {
        console.error("Server Error:", err);
      }

      res.status(status).json({
        status,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
      });
    });

    // Environment-specific setup
    const port = normalizePort(process.env.PORT || "3000");
    const host = process.env.HOST || "127.0.0.1";

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    server.listen(port, host, () => {
      log(`Server running on http://${host}:${port}`);
      log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // Handle server errors
    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.syscall !== "listen") throw error;

      const bind = `Port ${port}`;
      switch (error.code) {
        case "EACCES":
          console.error(`${bind} requires elevated privileges`);
          process.exit(1);
        case "EADDRINUSE":
          console.error(`${bind} is already in use`);
          process.exit(1);
        default:
          throw error;
      }
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Helper function to normalize port
function normalizePort(val: string): number | string {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return 0;
}

// Start the server
startServer();