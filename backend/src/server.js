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

// Inngest route
app.use("/inngest", serve({ client: inngest, functions }));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Success" });
});

// Home page
app.get("/", (req, res) => {
  res.send("<h1>Welcome to My API & Admin Dashboard Project</h1><p>Use /api/health to check backend.</p>");
});

// === SERVE ADMIN STATIC FILES ONLY LOCALLY ===
const isVercel = Boolean(process.env.VERCEL);

if (!isVercel) {
  // Local development/preview: serve built admin files via Express
  const adminDistPath = path.join(__dirname, "../admin/dist");
  app.use("/admin", express.static(adminDistPath));
  
  // Fallback for React Router (client-side routes) - only needed locally
  app.get("/admin/*", (req, res) => {
    res.sendFile(path.join(adminDistPath, "index.html"));
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

// Local server only
if (!isVercel) {
  const startServer = async () => {
    await connectDBOnce();
    app.listen(ENV.PORT, () => console.log(`Server running at http://localhost:${ENV.PORT}`));
  };
  startServer();
}

// Export for Vercel serverless
export default async function handler(req, res) {
  await connectDBOnce();
  app(req, res);
}