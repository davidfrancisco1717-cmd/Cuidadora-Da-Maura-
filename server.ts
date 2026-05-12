import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, profile, logs } = req.body;
      const { getChatResponse } = await import("./src/services/geminiService.js");
      const response = await getChatResponse(message, history, profile, logs);
      res.json({ response });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  app.post("/api/summary", async (req, res) => {
    try {
      const { logs, profile } = req.body;
      const { generateHealthSummary } = await import("./src/services/geminiService.js");
      const summary = generateHealthSummary(logs, profile);
      res.json({ summary });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate summary" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
