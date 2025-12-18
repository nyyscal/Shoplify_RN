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
app.use("/api/inngest", serve({ client: inngest, functions }));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Success" });
});

// Optional: Home page for backend root
app.get("/", (req, res) => {
  res.send("<h1>Welcome to My API & Admin Dashboard Project</h1><p>Use /api/health to check backend.</p>");
});

// Serve React admin in production locally (optional)
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../admin/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../admin/dist/index.html"));
  });
}

// DB connection
let isConnected = false;
const connectDBOnce = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

// Detect if running on Vercel (serverless)
const isVercel = Boolean(process.env.VERCEL);

if (!isVercel) {
  // Local server
  const startServer = async () => {
    await connectDBOnce();
    app.listen(ENV.PORT, () => {
      console.log(`Server running at http://localhost:${ENV.PORT}`);
    });
  };
  startServer();
}

// Export for Vercel
export default async function handler(req, res) {
  await connectDBOnce();
  app(req, res);
}
