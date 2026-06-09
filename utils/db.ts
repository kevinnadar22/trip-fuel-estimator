import { MongoClient, Db } from 'mongodb';
import { TripDocument } from '../types/index.js';

import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('Could not set custom DNS servers:', e);
}


let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(uri);
  const dbName = new URL(uri).pathname.substring(1) || 'trip-fuel-estimator';
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

export async function saveTripCalculation(trip: Omit<TripDocument, 'createdAt'>): Promise<string> {
  const { db } = await connectToDatabase();
  const collection = db.collection<TripDocument>('trips');
  const result = await collection.insertOne({
    ...trip,
    createdAt: new Date(),
  });
  return result.insertedId.toString();
}
