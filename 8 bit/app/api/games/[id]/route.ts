import { NextResponse } from "next/server"
import type { Game } from "@/lib/types"

// In-memory storage (replace with database in production)
const games: Game[] = [
  {
    id: "1",
    title: "The Legend of Zelda: Breath of the Wild",
    coverUrl: "/zelda-breath-of-the-wild-game-cover.jpg",
    status: "completed",
    hoursPlayed: 120,
    rating: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Elden Ring",
    coverUrl: "/generic-fantasy-game-cover.png",
    status: "playing",
    hoursPlayed: 45,
    rating: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Cyberpunk 2077",
    coverUrl: "/cyberpunk-2077-inspired-cover.png",
    status: "backlog",
    hoursPlayed: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Red Dead Redemption 2",
    coverUrl: "/red-dead-redemption-2-game-cover.jpg",
    status: "completed",
    hoursPlayed: 85,
    rating: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    title: "God of War Ragnarök",
    coverUrl: "/god-of-war-ragnarok-game-cover.jpg",
    status: "playing",
    hoursPlayed: 30,
    rating: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: "6",
    title: "Hollow Knight",
    coverUrl: "/hollow-knight-game-cover.jpg",
    status: "completed",
    hoursPlayed: 50,
    rating: 5,
    createdAt: new Date().toISOString(),
  },
]

// GET /api/games/[id] - Get a single game
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const game = games.find((g) => g.id === params.id)

  if (!game) {
    return NextResponse.json({ message: "Game not found" }, { status: 404 })
  }

  return NextResponse.json(game)
}

// PUT /api/games/[id] - Update a game
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const gameIndex = games.findIndex((g) => g.id === params.id)

    if (gameIndex === -1) {
      return NextResponse.json({ message: "Game not found" }, { status: 404 })
    }

    games[gameIndex] = {
      ...games[gameIndex],
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(games[gameIndex])
  } catch (error) {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 })
  }
}

// DELETE /api/games/[id] - Delete a game
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const gameIndex = games.findIndex((g) => g.id === params.id)

  if (gameIndex === -1) {
    return NextResponse.json({ message: "Game not found" }, { status: 404 })
  }

  games.splice(gameIndex, 1)

  return NextResponse.json({ success: true })
}
