/**
 * Script para inicializar la base de datos MongoDB
 * Crea los índices necesarios y opcionalmente inserta datos de ejemplo
 * 
 * Uso:
 * npx tsx scripts/init-db.ts
 */

import { getDatabase, initializeIndexes } from "../lib/mongodb"

async function main() {
  console.log("🚀 Iniciando configuración de MongoDB...")

  try {
    // 1. Inicializar índices
    console.log("\n📊 Creando índices...")
    await initializeIndexes()

    // 2. Verificar conexión
    console.log("\n🔍 Verificando conexión...")
    const db = await getDatabase()
    const collections = await db.listCollections().toArray()
    console.log("✅ Colecciones disponibles:", collections.map((c) => c.name).join(", "))

    // 3. Mostrar estadísticas
    const gamesCollection = db.collection("games")
    const reviewsCollection = db.collection("reviews")
    
    const gamesCount = await gamesCollection.countDocuments()
    const reviewsCount = await reviewsCollection.countDocuments()
    
    console.log("\n📈 Estadísticas actuales:")
    console.log(`   - Juegos: ${gamesCount}`)
    console.log(`   - Reseñas: ${reviewsCount}`)

    console.log("\n✅ ¡Base de datos configurada exitosamente!")
    console.log("\n💡 Próximos pasos:")
    console.log("   1. Asegúrate de tener MONGODB_URI en tu archivo .env.local")
    console.log("   2. Ejecuta 'pnpm dev' para iniciar la aplicación")
    console.log("   3. La aplicación está lista para usar MongoDB")

  } catch (error) {
    console.error("\n❌ Error configurando la base de datos:", error)
    process.exit(1)
  }

  process.exit(0)
}

main()
