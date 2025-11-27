import { MongoClient, Db, Collection, type Document as MongoDocument } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || "gametracker"

// Opciones de configuración para el cliente de MongoDB
const options = {}

// Variable global para mantener la conexión en desarrollo (evita múltiples conexiones)
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // En desarrollo, usar una variable global para preservar la conexión entre hot-reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // En producción, crear una nueva conexión
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

/**
 * Obtiene la instancia de la base de datos
 */
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db(dbName)
}

/**
 * Obtiene una colección específica
 */
export async function getCollection<TSchema extends MongoDocument = MongoDocument>(
  collectionName: string,
): Promise<Collection<TSchema>> {
  const db = await getDatabase()
  return db.collection<TSchema>(collectionName)
}

/**
 * Nombres de las colecciones
 */
export const Collections = {
  GAMES: "games",
  REVIEWS: "reviews",
  USERS: "users",
} as const

/**
 * Inicializa los índices de la base de datos
 * Debe ejecutarse una vez al inicio de la aplicación
 */
export async function initializeIndexes() {
  try {
    const db = await getDatabase()

    // Índices para la colección "games"
    const gamesCollection = db.collection(Collections.GAMES)
    await gamesCollection.createIndex({ userId: 1 })
    await gamesCollection.createIndex({ userId: 1, status: 1 })
    await gamesCollection.createIndex({ createdAt: -1 })

    // Índices para la colección "reviews"
    const reviewsCollection = db.collection(Collections.REVIEWS)
    await reviewsCollection.createIndex({ userId: 1 })
    await reviewsCollection.createIndex({ gameId: 1 })
    await reviewsCollection.createIndex({ userId: 1, createdAt: -1 })

  // Índices para la colección "users"
  const usersCollection = db.collection(Collections.USERS)
  await usersCollection.createIndex({ email: 1 }, { unique: true })

    console.log("✅ MongoDB indexes initialized successfully")
  } catch (error) {
    console.error("❌ Error initializing MongoDB indexes:", error)
    throw error
  }
}

// Export del cliente promise por defecto
export default clientPromise
