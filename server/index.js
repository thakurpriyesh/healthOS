import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import { createToken, hashPassword, verifyPassword, verifyToken } from "./auth.js";
import { defaultHealthData, sampleHealthData } from "./defaultHealthData.js";
import { readDb, updateDb } from "./storage.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const distDir = join(rootDir, "dist");
const port = Number(process.env.PORT || 4173);

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

async function getAuthedUser(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const payload = verifyToken(token);
  if (!payload) return null;

  const db = await readDb();
  return db.users.find((user) => user.id === payload.sub) || null;
}

async function ensureSampleUser() {
  await updateDb(async (db) => {
    const existing = db.users.find((user) => user.email === sampleUser.email);
    if (existing) {
      existing.name = sampleUser.name;
      existing.healthData = structuredClone(sampleHealthData);
      return;
    }

    db.users.push({
      id: randomUUID(),
      name: sampleUser.name,
      email: sampleUser.email,
      passwordHash: await hashPassword(sampleUser.password),
      createdAt: new Date().toISOString(),
      healthData: structuredClone(sampleHealthData),
    });
  });
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

      const result = await updateDb(async (db) => {
        if (db.users.some((user) => user.email === cleanEmail)) {
          return { error: "An account with this email already exists." };
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
        db.users.push(user);
        return { user };
      });

      if (result.error) return sendJson(res, 409, { error: result.error });
      return sendJson(res, 201, {
        token: createToken(result.user.id),
        user: publicUser(result.user),
        healthData: result.user.healthData,
      });
    }

    if (req.method === "POST" && req.url === "/api/auth/login") {
      const { email, password } = await readJson(req);
      const cleanEmail = String(email || "").trim().toLowerCase();
      const db = await readDb();
      const user = db.users.find((item) => item.email === cleanEmail);

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

      await updateDb((db) => {
        const record = db.users.find((item) => item.id === user.id);
        record.name = healthData.profile?.name || record.name;
        record.healthData = healthData;
      });

      return sendJson(res, 200, { ok: true });
    }

    return sendJson(res, 404, { error: "Not found." });
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: "Something went wrong on the server." });
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
