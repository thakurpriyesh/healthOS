import { MongoClient } from "mongodb";

let db;

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "health-manager";

  if (!uri) {
    throw new Error("MONGODB_URI is required. Use a MongoDB Atlas connection string or another remote MongoDB URI.");
  }

  if (db) return db;

  const client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  return db;
}

export function usersCollection() {
  if (!db) {
    throw new Error("Database has not been connected yet.");
  }
  return db.collection("users");
}
