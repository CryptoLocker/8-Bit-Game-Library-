import { NextRequest, NextResponse } from "next/server"
import type { Review, ReviewDocument } from "@/lib/types"
import { getCollection, Collections } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
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

// GET /api/reviews/[id] - Obtener una reseña específica
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
      return NextResponse.json({ message: "Invalid review ID" }, { status: 400 })
    }

    const collection = await getCollection<ReviewDocument>(Collections.REVIEWS)
    const review = await collection.findOne({ _id: new ObjectId(id), userId })

    if (!review) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 })
    }

    return NextResponse.json(documentToReview(review))
  } catch (error) {
    console.error("Error fetching review:", error)
    return NextResponse.json(
      { message: "Error fetching review", error: String(error) },
      { status: 500 }
    )
  }
}

// PUT /api/reviews/[id] - Actualizar una reseña
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
      return NextResponse.json({ message: "Invalid review ID" }, { status: 400 })
    }

    // Validar rating si se proporciona
    if (body.rating !== undefined && (body.rating < 0 || body.rating > 5)) {
      return NextResponse.json(
        { message: "Rating must be between 0 and 5" },
        { status: 400 }
      )
    }

    const collection = await getCollection<ReviewDocument>(Collections.REVIEWS)

    // Preparar los campos a actualizar
    const updateFields: Partial<ReviewDocument> = {
      updatedAt: new Date(),
    }

    // Solo actualizar campos que se proporcionen
    if (body.rating !== undefined) updateFields.rating = body.rating
    if (body.content !== undefined) updateFields.content = body.content
    if (body.gameTitle !== undefined) updateFields.gameTitle = body.gameTitle
    if (body.gameCover !== undefined) updateFields.gameCover = body.gameCover

    // Actualizar el documento
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      { $set: updateFields },
      { returnDocument: "after" }
    )

    if (!result) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 })
    }

    return NextResponse.json(documentToReview(result))
  } catch (error) {
    console.error("Error updating review:", error)
    return NextResponse.json(
      { message: "Error updating review", error: String(error) },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews/[id] - Eliminar una reseña
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
      return NextResponse.json({ message: "Invalid review ID" }, { status: 400 })
    }

    const collection = await getCollection<ReviewDocument>(Collections.REVIEWS)
    const result = await collection.deleteOne({ _id: new ObjectId(id), userId })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json(
      { message: "Error deleting review", error: String(error) },
      { status: 500 }
    )
  }
}
