import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI;
export const client = new MongoClient(uri);

let db = null;

function connect() {
  db = client.db("ch1");

  return db;
}

export function getDB() {
  if (!db) return connect();
  return db;
}
