import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const env = await load({ envPath: "./server/.env" });

const app = new Hono();

// Middleware
app.use("*", cors({
  origin: "http://localhost:5173", // Vite's default port
  credentials: true,
}));

// Routes
app.get("/api/health", (c) => c.json({ status: "ok", message: "Server is running!" }));

// Start server
Deno.serve({ port: Number(env["PORT"]) || 5000 }, app.fetch);
console.log(`Server running on port ${env["PORT"] || 5000}`);