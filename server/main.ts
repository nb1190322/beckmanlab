import { Hono } from "hono";
import { cors } from "hono/cors";
import { load } from "load";
import { connectDB } from "./db.ts";
import { authRoutes } from "./routes/auth.ts";
import { userRoutes } from "./routes/users.ts";
import { friendRoutes } from "./routes/friends.ts";

const env = await load({ envPath: "./server/.env" });

await connectDB(env["MONGO_URI"]);

const app = new Hono();

app.use("*", cors({
    origin: env["FRONTEND_URL"] || "http://localhost:5173",
    credentials: true,
}));

app.route("/", authRoutes(env));
app.route("/", userRoutes());
app.route("/", friendRoutes());

Deno.serve({ port: Number(env["PORT"]) || 5000 }, app.fetch);
console.log(`Server running on port ${env["PORT"] || 5000}`);