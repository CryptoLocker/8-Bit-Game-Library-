// Steam Web API Client for fetching game data
// Requires STEAM_API_KEY environment variable

export async function searchSteamGames(query: string) {
  try {
    // Steam doesn't have a direct search API, so we use the store search
    const response = await fetch(
      `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=US`,
    )

    if (!response.ok) {
      throw new Error(`Steam API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error("[v0] Steam search error:", error)
    throw error
  }
}

export async function getSteamGameDetails(appId: number) {
  try {
    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`)

    if (!response.ok) {
      throw new Error(`Steam API error: ${response.statusText}`)
    }

    const data = await response.json()
    const gameData = data[appId]

    if (!gameData || !gameData.success) {
      throw new Error("Game not found")
    }

    return gameData.data
  } catch (error) {
    console.error("[v0] Steam get game error:", error)
    throw error
  }
}

export async function getSteamOwnedGames(steamId: string) {
  const apiKey = process.env.STEAM_API_KEY

  if (!apiKey) {
    throw new Error("Steam API key not configured. Please add STEAM_API_KEY to your environment variables.")
  }

  try {
    const response = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true&format=json`,
    )

    if (!response.ok) {
      throw new Error(`Steam API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.response?.games || []
  } catch (error) {
    console.error("[v0] Steam owned games error:", error)
    throw error
  }
}

export async function syncSteamPlaytime(steamId: string, appId: number): Promise<number | null> {
  const apiKey = process.env.STEAM_API_KEY

  if (!apiKey) {
    throw new Error("Steam API key not configured. Please add STEAM_API_KEY to your environment variables.")
  }

  try {
    const response = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true&format=json`,
    )

    if (!response.ok) {
      throw new Error(`Steam API error: ${response.statusText}`)
    }

    const data = await response.json()
    const games = data.response?.games || []

    const game = games.find((g: any) => g.appid === appId)

    if (game && game.playtime_forever) {
      // Convert minutes to hours
      return Math.round((game.playtime_forever / 60) * 10) / 10
    }

    return null
  } catch (error) {
    console.error("[v0] Steam playtime sync error:", error)
    throw error
  }
}
