// IGDB API Client for fetching game data
// Requires IGDB_CLIENT_ID and IGDB_CLIENT_SECRET environment variables

let cachedAccessToken: string | null = null
let tokenExpiry = 0

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedAccessToken && Date.now() < tokenExpiry) {
    return cachedAccessToken
  }

  const clientId = process.env.IGDB_CLIENT_ID
  const clientSecret = process.env.IGDB_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error("[v0] IGDB credentials missing:", {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
    })
    throw new Error("IGDB_CLIENT_ID or IGDB_CLIENT_SECRET not found in environment variables")
  }

  try {
    const response = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: "POST" },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] IGDB token response error:", errorText)
      throw new Error(`Failed to get IGDB access token: ${response.statusText}`)
    }

    const data = await response.json()
    cachedAccessToken = data.access_token
    // Set expiry to 5 minutes before actual expiry for safety
    tokenExpiry = Date.now() + (data.expires_in - 300) * 1000

    console.log("[v0] IGDB access token obtained successfully")
    return cachedAccessToken
  } catch (error) {
    console.error("[v0] IGDB authentication error:", error)
    throw error
  }
}

export async function searchIGDBGames(query: string, limit = 10) {
  try {
    const accessToken = await getAccessToken()
    const clientId = process.env.IGDB_CLIENT_ID

    const response = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": clientId!,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "text/plain",
      },
      body: `search "${query}"; fields name,cover.url,summary,genres.name,release_dates.date,rating,platforms.name,involved_companies.company.name,involved_companies.developer,involved_companies.publisher; limit ${limit};`,
    })

    if (!response.ok) {
      throw new Error(`IGDB API error: ${response.statusText}`)
    }

    const games = await response.json()
    return games
  } catch (error) {
    console.error("[v0] IGDB search error:", error)
    throw error
  }
}

export async function getIGDBGameById(gameId: number) {
  try {
    const accessToken = await getAccessToken()
    const clientId = process.env.IGDB_CLIENT_ID

    const response = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": clientId!,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "text/plain",
      },
      body: `where id = ${gameId}; fields name,cover.url,summary,genres.name,release_dates.date,rating,platforms.name,involved_companies.company.name,involved_companies.developer,involved_companies.publisher;`,
    })

    if (!response.ok) {
      throw new Error(`IGDB API error: ${response.statusText}`)
    }

    const games = await response.json()
    return games[0] || null
  } catch (error) {
    console.error("[v0] IGDB get game error:", error)
    throw error
  }
}
