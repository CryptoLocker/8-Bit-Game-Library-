import { NextResponse } from "next/server"
import { searchIGDBGames } from "@/lib/igdb-client"
import { searchSteamGames } from "@/lib/steam-client"
import type { ExternalGameData } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const source = searchParams.get("source") || "all" // 'steam', 'igdb', or 'all'

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    const results: ExternalGameData[] = []
    const errors: { source: string; message: string }[] = []

    // Search IGDB
    if (source === "igdb" || source === "all") {
      try {
        console.log("[v0] Attempting IGDB search for:", query)
        const igdbGames = await searchIGDBGames(query, 5)
        const igdbResults: ExternalGameData[] = igdbGames.map((game: any) => ({
          title: game.name,
          coverUrl: game.cover?.url
            ? `https:${game.cover.url.replace("t_thumb", "t_cover_big")}`
            : "/placeholder.svg?height=400&width=300",
          description: game.summary,
          genres: game.genres?.map((g: any) => g.name),
          releaseDate: game.release_dates?.[0]?.date
            ? new Date(game.release_dates[0].date * 1000).toLocaleDateString()
            : undefined,
          source: "igdb" as const,
          externalId: game.id,
        }))
        results.push(...igdbResults)
        console.log("[v0] IGDB search successful, found", igdbResults.length, "games")
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        console.error("[v0] IGDB search failed:", errorMessage)
        errors.push({ source: "IGDB", message: errorMessage })
      }
    }

    // Search Steam
    if (source === "steam" || source === "all") {
      try {
        console.log("[v0] Attempting Steam search for:", query)
        const steamGames = await searchSteamGames(query)
        const steamResults: ExternalGameData[] = steamGames.slice(0, 5).map((game: any) => ({
          title: game.name,
          coverUrl: game.tiny_image || "/placeholder.svg?height=400&width=300",
          description: undefined,
          source: "steam" as const,
          externalId: game.id,
        }))
        results.push(...steamResults)
        console.log("[v0] Steam search successful, found", steamResults.length, "games")
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        console.error("[v0] Steam search failed:", errorMessage)
        errors.push({ source: "Steam", message: errorMessage })
      }
    }

    return NextResponse.json({
      results,
      errors: errors.length > 0 ? errors : undefined,
      hasResults: results.length > 0,
    })
  } catch (error) {
    console.error("[v0] External game search error:", error)
    return NextResponse.json(
      {
        error: "Failed to search external games",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
