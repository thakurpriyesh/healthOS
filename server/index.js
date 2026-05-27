import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import { createToken, hashPassword, verifyPassword, verifyToken } from "./auth.js";
import { defaultHealthData, sampleHealthData } from "./defaultHealthData.js";
import { connectDb, usersCollection } from "./db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const distDir = join(rootDir, "dist");
const port = Number(process.env.PORT || 4173);
const defaultGeminiModel = "gemini-3.5-flash";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const sampleUser = {
  name: "Rachana Dutta",
  email: "demo@healthos.test",
  password: "password123",
};

async function loadEnvFile() {
  try {
    const env = await readFile(join(rootDir, ".env"), "utf8");
    for (const line of env.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;

      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

function sendJson(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function geminiModelPath() {
  const model = process.env.GEMINI_MODEL || defaultGeminiModel;
  return model.startsWith("models/") ? model : `models/${model}`;
}

async function generateHealthAssistantReply({ messages, healthContext }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error("GEMINI_API_KEY is not configured.");
    error.status = 503;
    throw error;
  }

  const systemPrompt = `You are a knowledgeable, empathetic AI Health Assistant integrated into a personal health management system. You have access to the user's current health data. Be helpful, concise, and always remind users to consult their doctor for medical decisions. Never diagnose. Provide clear, brief answers with occasional bullet points for readability. Avoid complex markdown elements like tables. ${healthContext || ""}`;

  const contents = messages.map((message) => ({
    role: message.role === "ai" ? "model" : "user",
    parts: [{ text: String(message.content || "") }],
  }));

  const url = new URL(`https://generativelanguage.googleapis.com/v1beta/${geminiModelPath()}:generateContent`);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error?.message || "The AI service could not process that request.");
    error.status = response.status;
    throw error;
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that. Please try again.";
}

async function getAuthedUser(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const payload = verifyToken(token);
  if (!payload) return null;

  return usersCollection().findOne({ id: payload.sub });
}

async function ensureSampleUser() {
  const users = usersCollection();
  const existing = await users.findOne({ email: sampleUser.email });

  if (!existing) {
    await users.insertOne({
      id: randomUUID(),
      name: sampleUser.name,
      email: sampleUser.email,
      passwordHash: await hashPassword(sampleUser.password),
      createdAt: new Date().toISOString(),
      healthData: structuredClone(sampleHealthData),
    });
    return;
  }

  if (!existing.healthData || Object.keys(existing.healthData).length === 0) {
    await users.updateOne(
      { email: sampleUser.email },
      { $set: { name: sampleUser.name, healthData: structuredClone(sampleHealthData) } }
    );
  }
}

async function handleApi(req, res) {
  try {
    if (req.method === "POST" && req.url === "/api/auth/register") {
      const { name, email, password } = await readJson(req);
      const cleanEmail = String(email || "").trim().toLowerCase();
      const cleanName = String(name || "").trim();

      if (!cleanName || !cleanEmail || String(password || "").length < 8) {
        return sendJson(res, 400, { error: "Name, email, and an 8+ character password are required." });
      }

      const users = usersCollection();
      const existing = await users.findOne({ email: cleanEmail });
      if (existing) {
        return sendJson(res, 409, { error: "An account with this email already exists." });
      }

      const user = {
        id: randomUUID(),
        name: cleanName,
        email: cleanEmail,
        passwordHash: await hashPassword(password),
        createdAt: new Date().toISOString(),
        healthData: {
          ...structuredClone(defaultHealthData),
          profile: { ...defaultHealthData.profile, name: cleanName },
        },
      };
      await users.insertOne(user);

      return sendJson(res, 201, {
        token: createToken(user.id),
        user: publicUser(user),
        healthData: user.healthData,
      });
    }

    if (req.method === "POST" && req.url === "/api/auth/login") {
      const { email, password } = await readJson(req);
      const cleanEmail = String(email || "").trim().toLowerCase();
      const user = await usersCollection().findOne({ email: cleanEmail });

      if (!user || !(await verifyPassword(String(password || ""), user.passwordHash))) {
        return sendJson(res, 401, { error: "Invalid email or password." });
      }

      return sendJson(res, 200, {
        token: createToken(user.id),
        user: publicUser(user),
        healthData: user.healthData,
      });
    }

    if (req.method === "GET" && req.url === "/api/me") {
      const user = await getAuthedUser(req);
      if (!user) return sendJson(res, 401, { error: "Please sign in again." });
      return sendJson(res, 200, { user: publicUser(user), healthData: user.healthData });
    }

    if (req.method === "PUT" && req.url === "/api/data") {
      const user = await getAuthedUser(req);
      if (!user) return sendJson(res, 401, { error: "Please sign in again." });

      const { healthData } = await readJson(req);
      if (!healthData || typeof healthData !== "object") {
        return sendJson(res, 400, { error: "Missing health data." });
      }

      await usersCollection().updateOne(
        { id: user.id },
        { $set: { name: healthData.profile?.name || user.name, healthData } }
      );

      return sendJson(res, 200, { ok: true });
    }

    if (req.method === "POST" && req.url === "/api/ai") {
      const user = await getAuthedUser(req);
      if (!user) return sendJson(res, 401, { error: "Please sign in again." });

      const { messages, healthContext } = await readJson(req);
      if (!Array.isArray(messages) || messages.length === 0) {
        return sendJson(res, 400, { error: "Missing chat messages." });
      }

      const safeMessages = messages
        .filter((message) => message && ["ai", "user"].includes(message.role))
        .slice(-12)
        .map((message) => ({
          role: message.role,
          content: String(message.content || "").slice(0, 4000),
        }))
        .filter((message) => message.content.trim());

      while (safeMessages[0]?.role === "ai") {
        safeMessages.shift();
      }

      if (!safeMessages.length || safeMessages.at(-1).role !== "user") {
        return sendJson(res, 400, { error: "The latest chat message must be from the user." });
      }

      const text = await generateHealthAssistantReply({
        messages: safeMessages,
        healthContext: String(healthContext || "").slice(0, 4000),
      });

      return sendJson(res, 200, { text });
    }

    return sendJson(res, 404, { error: "Not found." });
  } catch (error) {
    console.error(error);
    return sendJson(res, error.status || 500, { error: error.status ? error.message : "Something went wrong on the server." });
  }
}

async function serveStatic(req, res) {
  const requestedPath = req.url === "/" ? "/index.html" : decodeURIComponent(req.url.split("?")[0]);
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(distDir, safePath);

  try {
    const file = await readFile(filePath);
    res.writeHead(200, { "content-type": mimeTypes[extname(filePath)] || "application/octet-stream" });
    res.end(file);
  } catch {
    const fallback = await readFile(join(distDir, "index.html"));
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(fallback);
  }
}

try {
  await loadEnvFile();
  await connectDb();
  await ensureSampleUser();

  createServer((req, res) => {
    if (req.url.startsWith("/api/")) {
      handleApi(req, res);
      return;
    }

    serveStatic(req, res);
  }).listen(port, () => {
    console.log(`Health Manager server listening on http://localhost:${port}`);
  });
} catch (error) {
  console.error(`Server startup failed: ${error.message}`);
  process.exit(1);
}
