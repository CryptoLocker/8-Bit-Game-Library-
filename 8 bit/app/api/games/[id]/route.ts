import { NextRequest, NextResponse } from "next/server"
import type { Game, GameDocument } from "@/lib/types"
import { getCollection, Collections } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
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

// GET /api/games/[id] - Obtener un juego específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const userId = sessionUser.id

    const { id } = params
    
    // Validar que el ID sea un ObjectId válido
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid game ID" }, { status: 400 })
    }

    const collection = await getCollection<GameDocument>(Collections.GAMES)
    const game = await collection.findOne({ _id: new ObjectId(id), userId })

    if (!game) {
      return NextResponse.json({ message: "Game not found" }, { status: 404 })
    }

    return NextResponse.json(documentToGame(game))
  } catch (error) {
    console.error("Error fetching game:", error)
    return NextResponse.json(
      { message: "Error fetching game", error: String(error) },
      { status: 500 }
    )
  }
}

// PUT /api/games/[id] - Actualizar un juego
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const userId = sessionUser.id

    const { id } = params
    const body = await request.json()

    // Validar que el ID sea un ObjectId válido
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid game ID" }, { status: 400 })
    }

    const collection = await getCollection<GameDocument>(Collections.GAMES)

    // Preparar los campos a actualizar (excluir campos que no deberían cambiar)
    const updateFields: Partial<GameDocument> = {
      updatedAt: new Date(),
    }

    // Solo actualizar campos que se proporcionen
    if (body.title !== undefined) updateFields.title = body.title
    if (body.coverUrl !== undefined) updateFields.coverUrl = body.coverUrl
    if (body.status !== undefined) updateFields.status = body.status
    if (body.hoursPlayed !== undefined) updateFields.hoursPlayed = body.hoursPlayed
    if (body.rating !== undefined) updateFields.rating = body.rating
    if (body.genres !== undefined) updateFields.genres = body.genres
    if (body.platforms !== undefined) updateFields.platforms = body.platforms
    if (body.releaseDate !== undefined) updateFields.releaseDate = body.releaseDate
    if (body.description !== undefined) updateFields.description = body.description
    if (body.developer !== undefined) updateFields.developer = body.developer
    if (body.publisher !== undefined) updateFields.publisher = body.publisher
    if (body.source !== undefined) updateFields.source = body.source
    if (body.externalId !== undefined) updateFields.externalId = body.externalId
    if (body.isNew !== undefined) updateFields.isNew = body.isNew

    // Actualizar el documento
    const updatedGame = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      { $set: updateFields },
      { returnDocument: "after" }
    )

    if (!updatedGame) {
      return NextResponse.json({ message: "Game not found" }, { status: 404 })
    }

    return NextResponse.json(documentToGame(updatedGame))
  } catch (error) {
    console.error("Error updating game:", error)
    return NextResponse.json(
      { message: "Error updating game", error: String(error) },
      { status: 500 }
    )
  }
}

// DELETE /api/games/[id] - Eliminar un juego
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const userId = sessionUser.id

    const { id } = params

    // Validar que el ID sea un ObjectId válido
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid game ID" }, { status: 400 })
    }

    const collection = await getCollection<GameDocument>(Collections.GAMES)
    const result = await collection.deleteOne({ _id: new ObjectId(id), userId })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Game not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting game:", error)
    return NextResponse.json(
      { message: "Error deleting game", error: String(error) },
      { status: 500 }
    )
  }
}
