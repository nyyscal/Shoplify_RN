import express from "express";
import path from "path";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { functions, inngest } from "./config/inngest.js";

const app = express();

// Middleware
app.use(express.json());
app.use(clerkMiddleware());

// Inngest route (without /api prefix)
app.use("/inngest", serve({ client: inngest, functions }));

// Health check (remove /api prefix for Vercel routing)
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Success" });
});

// Home page
app.get("/", (req, res) => {
  res.send("<h1>Welcome to My API & Admin Dashboard Project</h1><p>Use /api/health to check backend.</p>");
});

// Serve React admin **locally only** if needed
if (ENV.NODE_ENV === "production") {
  app.use("/admin", express.static(path.join(__dirname, "../admin/dist")));
}

// DB connection
let isConnected = false;
const connectDBOnce = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

// Local server
const isVercel = Boolean(process.env.VERCEL);
if (!isVercel) {
  const startServer = async () => {
    await connectDBOnce();
    app.listen(ENV.PORT, () => console.log(`Server running at http://localhost:${ENV.PORT}`));
  };
  startServer();
}

// Export for Vercel
export default async function handler(req, res) {
  await connectDBOnce();
  app(req, res);
}
