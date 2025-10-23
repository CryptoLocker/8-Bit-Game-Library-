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

// GET /api/games - Get all games
export async function GET() {
  return NextResponse.json(games)
}

// POST /api/games - Create a new game
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newGame: Game = {
      id: Date.now().toString(),
      title: body.title,
      coverUrl: body.coverUrl || "",
      status: body.status || "backlog",
      hoursPlayed: body.hoursPlayed || 0,
      rating: body.rating,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    games.push(newGame)

    return NextResponse.json(newGame, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 })
  }
}
