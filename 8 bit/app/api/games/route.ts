import { NextRequest, NextResponse } from "next/server"
import type { Game, GameDocument } from "@/lib/types"
import { getCollection, Collections } from "@/lib/mongodb"
import { getSessionUser } from "@/lib/auth"

// Función helper para convertir documento de MongoDB a Game
function documentToGame(doc: any): Game {
  return {
    id: doc._id.toString(),
    title: doc.title,
    coverUrl: doc.coverUrl,
    status: doc.status,
    hoursPlayed: doc.hoursPlayed,
    rating: doc.rating,
    genres: doc.genres,
    platforms: doc.platforms,
    releaseDate: doc.releaseDate,
    description: doc.description,
    developer: doc.developer,
    publisher: doc.publisher,
    source: doc.source,
    externalId: doc.externalId,
    isNew: doc.isNew,
    userId: doc.userId,
    createdAt:
      doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt:
      doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
  }
}

// GET /api/games - Obtener todos los juegos
export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const userId = sessionUser.id

    const collection = await getCollection<GameDocument>(Collections.GAMES)
    
    // Buscar todos los juegos del usuario
    const games = await collection.find({ userId }).sort({ createdAt: -1 }).toArray()
    
    // Convertir documentos de MongoDB a objetos Game
    const gamesResponse = games.map(documentToGame)

    return NextResponse.json(gamesResponse)
  } catch (error) {
    console.error("Error fetching games:", error)
    return NextResponse.json(
      { message: "Error fetching games", error: String(error) },
      { status: 500 }
    )
  }
}

// POST /api/games - Crear un nuevo juego
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const userId = sessionUser.id

    // Validar campos requeridos
    if (!body.title || !body.coverUrl) {
      return NextResponse.json(
        { message: "Title and coverUrl are required" },
        { status: 400 }
      )
    }

    const collection = await getCollection<GameDocument>(Collections.GAMES)
    
  const now = new Date()

    // Crear el documento del juego
    const gameDocument: GameDocument = {
      title: body.title,
      coverUrl: body.coverUrl,
      status: body.status || "backlog",
      hoursPlayed: body.hoursPlayed || 0,
      rating: body.rating,
      genres: body.genres || [],
      platforms: body.platforms || [],
      releaseDate: body.releaseDate,
      description: body.description,
      developer: body.developer,
      publisher: body.publisher,
      source: body.source || "manual",
      externalId: body.externalId,
      isNew: body.isNew !== undefined ? body.isNew : true,
      userId,
      createdAt: now,
      updatedAt: now,
    }

    // Insertar en MongoDB
    const result = await collection.insertOne(gameDocument as any)
    
    // Obtener el juego recién creado
    const newGame = await collection.findOne({ _id: result.insertedId })
    
    if (!newGame) {
      throw new Error("Failed to retrieve created game")
    }

    return NextResponse.json(documentToGame(newGame), { status: 201 })
  } catch (error) {
    console.error("Error creating game:", error)
    return NextResponse.json(
      { message: "Error creating game", error: String(error) },
      { status: 500 }
    )
  }
}
