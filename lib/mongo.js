import { MongoClient } from 'mongodb'

const uri = process.env.MONGO_URL
const dbName = process.env.DB_NAME || 'four_o_four_store'

let cachedClient = global._mongoClient404
let cachedDb = global._mongoDb404

export async function getDb() {
  if (cachedDb) return cachedDb
  if (!uri) throw new Error('MONGO_URL is not set')
  if (!cachedClient) {
    cachedClient = new MongoClient(uri)
    await cachedClient.connect()
    global._mongoClient404 = cachedClient
  }
  cachedDb = cachedClient.db(dbName)
  global._mongoDb404 = cachedDb
  return cachedDb
}
