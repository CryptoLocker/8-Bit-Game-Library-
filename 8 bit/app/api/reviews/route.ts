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
      "An absolute masterpiece that redefined open-world gaming. The freedom to explore, the physics-based puzzles, and the sense of discovery make this one of the best games ever made. Every corner of Hyrule has something interesting to find.",
    createdAt: "2024-01-20T00:00:00.000Z",
  },
  {
    id: "2",
    gameId: "2",
    gameTitle: "Elden Ring",
    gameCover: "/generic-fantasy-game-cover.png",
    rating: 5,
    content:
      "FromSoftware's magnum opus. The open world design perfectly complements the challenging combat. The lore is deep and mysterious, and the boss fights are some of the best in gaming. A must-play for any RPG fan.",
    createdAt: "2024-02-15T00:00:00.000Z",
  },
]

// GET /api/reviews - Get all reviews or filter by gameId
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const gameId = searchParams.get("gameId")

  if (gameId) {
    const filteredReviews = reviews.filter((r) => r.gameId === gameId)
    return NextResponse.json(filteredReviews)
  }

  return NextResponse.json(reviews)
}

// POST /api/reviews - Create a new review
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newReview: Review = {
      id: Date.now().toString(),
      gameId: body.gameId,
      gameTitle: body.gameTitle,
      gameCover: body.gameCover,
      rating: body.rating,
      content: body.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    reviews.push(newReview)

    return NextResponse.json(newReview, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 })
  }
}
