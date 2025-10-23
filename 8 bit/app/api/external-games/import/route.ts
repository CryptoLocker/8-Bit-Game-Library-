import { NextResponse } from "next/server"
import { getIGDBGameById } from "@/lib/igdb-client"
import { getSteamGameDetails } from "@/lib/steam-client"
import type { ExternalGameData } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get("source")
    const id = searchParams.get("id")

    if (!source || !id) {
      return NextResponse.json({ error: "Source and ID parameters are required" }, { status: 400 })
    }

    let gameData: ExternalGameData | null = null

    if (source === "igdb") {
      const game = await getIGDBGameById(Number.parseInt(id))
      if (game) {
        const developer = game.involved_companies?.find((ic: any) => ic.developer)?.company?.name
        const publisher = game.involved_companies?.find((ic: any) => ic.publisher)?.company?.name

        gameData = {
          title: game.name,
          coverUrl: game.cover?.url
            ? `https:${game.cover.url.replace("t_thumb", "t_cover_big")}`
            : "/placeholder.svg?height=400&width=300",
          description: game.summary,
          genres: game.genres?.map((g: any) => g.name),
          releaseDate: game.release_dates?.[0]?.date
            ? new Date(game.release_dates[0].date * 1000).toLocaleDateString()
            : undefined,
          platforms: game.platforms?.map((p: any) => p.name),
          developer,
          publisher,
          source: "igdb",
          externalId: game.id,
        }
      }
    } else if (source === "steam") {
      const game = await getSteamGameDetails(Number.parseInt(id))
      if (game) {
        gameData = {
          title: game.name,
          coverUrl: game.header_image || "/placeholder.svg?height=400&width=300",
          description: game.short_description,
          genres: game.genres?.map((g: any) => g.description),
          releaseDate: game.release_date?.date,
          platforms: game.platforms ? Object.keys(game.platforms).filter((k) => game.platforms[k]) : undefined,
          developer: game.developers?.[0],
          publisher: game.publishers?.[0],
          source: "steam",
          externalId: game.steam_appid,
        }
      }
    }

    if (!gameData) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    return NextResponse.json(gameData)
  } catch (error) {
    console.error("[v0] External game import error:", error)
    return NextResponse.json({ error: "Failed to import game data" }, { status: 500 })
  }
}
