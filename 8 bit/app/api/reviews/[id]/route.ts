import { NextResponse } from "next/server"
import type { Review } from "@/lib/types"

// In-memory storage (replace with database in production)
const reviews: Review[] = [
  {
    id: "1",
    gameId: "1",
    gameTitle: "The Legend of Zelda: Breath of the Wild",
    gameCover: "/zelda-breath-of-the-wild-game-cover.jpg",
    rating: 5,
    content:
      "An absolute masterpiece that redefined open-world gaming. The freedom to explore, the physics-based puzzles, and the sense of discovery make this one of the best games ever made.",
    createdAt: "2024-01-20T00:00:00.000Z",
  },
  {
    id: "2",
    gameId: "2",
    gameTitle: "Elden Ring",
    gameCover: "/generic-fantasy-game-cover.png",
    rating: 5,
    content:
      "FromSoftware's magnum opus. The open world design perfectly complements the challenging combat. The lore is deep and mysterious, and the boss fights are some of the best in gaming.",
    createdAt: "2024-02-15T00:00:00.000Z",
  },
]

// GET /api/reviews/[id] - Get a single review
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const review = reviews.find((r) => r.id === params.id)

  if (!review) {
    return NextResponse.json({ message: "Review not found" }, { status: 404 })
  }

  return NextResponse.json(review)
}

// PUT /api/reviews/[id] - Update a review
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const reviewIndex = reviews.findIndex((r) => r.id === params.id)

    if (reviewIndex === -1) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 })
    }

    reviews[reviewIndex] = {
      ...reviews[reviewIndex],
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(reviews[reviewIndex])
  } catch (error) {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 })
  }
}

// DELETE /api/reviews/[id] - Delete a review
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const reviewIndex = reviews.findIndex((r) => r.id === params.id)

  if (reviewIndex === -1) {
    return NextResponse.json({ message: "Review not found" }, { status: 404 })
  }

  reviews.splice(reviewIndex, 1)

  return NextResponse.json({ success: true })
}
