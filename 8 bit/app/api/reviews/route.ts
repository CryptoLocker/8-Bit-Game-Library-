import { NextRequest, NextResponse } from "next/server"
import type { Review, ReviewDocument } from "@/lib/types"
import { getCollection, Collections } from "@/lib/mongodb"
import { getSessionUser } from "@/lib/auth"

// Función helper para convertir documento de MongoDB a Review
function documentToReview(doc: any): Review {
  return {
    id: doc._id.toString(),
    gameId: doc.gameId,
    userId: doc.userId,
    gameTitle: doc.gameTitle,
    gameCover: doc.gameCover,
    rating: doc.rating,
    content: doc.content,
    createdAt:
      doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt:
      doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
  }
}

// GET /api/reviews - Obtener todas las reseñas o filtrar por gameId/userId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get("gameId")
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const userId = sessionUser.id

    const collection = await getCollection<ReviewDocument>(Collections.REVIEWS)
    
    // Construir el filtro de búsqueda
    const filter: any = { userId }
    if (gameId) {
      filter.gameId = gameId
    }

    // Buscar reseñas
    const reviews = await collection.find(filter).sort({ createdAt: -1 }).toArray()
    
    // Convertir documentos de MongoDB a objetos Review
    const reviewsResponse = reviews.map(documentToReview)

    return NextResponse.json(reviewsResponse)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { message: "Error fetching reviews", error: String(error) },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Crear una nueva reseña
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const userId = sessionUser.id

    // Validar campos requeridos
    if (!body.gameId || !body.gameTitle || !body.rating || !body.content) {
      return NextResponse.json(
        { message: "gameId, gameTitle, rating, and content are required" },
        { status: 400 }
      )
    }

    // Validar rating
    if (body.rating < 0 || body.rating > 5) {
      return NextResponse.json(
        { message: "Rating must be between 0 and 5" },
        { status: 400 }
      )
    }

    const collection = await getCollection<ReviewDocument>(Collections.REVIEWS)

  const now = new Date()

    // Crear el documento de la reseña
    const reviewDocument: ReviewDocument = {
      gameId: body.gameId,
      userId,
      gameTitle: body.gameTitle,
      gameCover: body.gameCover || "",
      rating: body.rating,
      content: body.content,
      createdAt: now,
      updatedAt: now,
    }

    // Insertar en MongoDB
    const result = await collection.insertOne(reviewDocument as any)
    
    // Obtener la reseña recién creada
    const newReview = await collection.findOne({ _id: result.insertedId })
    
    if (!newReview) {
      throw new Error("Failed to retrieve created review")
    }

    return NextResponse.json(documentToReview(newReview), { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json(
      { message: "Error creating review", error: String(error) },
      { status: 500 }
    )
  }
}
