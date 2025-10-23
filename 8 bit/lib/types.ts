export type GameStatus = "playing" | "completed" | "backlog"

export interface Game {
  id: string
  title: string
  coverUrl: string
  status: GameStatus
  hoursPlayed: number
  rating?: number
  genres?: string[]
  releaseDate?: string
  description?: string
  source?: "steam" | "igdb" | "manual"
  externalId?: string | number
  platforms?: string[]
  developer?: string
  publisher?: string
  isNew?: boolean // Flag for recently added games
  createdAt?: string
  updatedAt?: string
}

export interface Review {
  id: string
  gameId: string
  gameTitle: string
  gameCover: string
  rating: number
  content: string
  createdAt: string
  updatedAt?: string
}

export interface GameStats {
  totalGames: number
  completedGames: number
  totalHours: number
  averageRating: number
  gamesPlaying: number
  gamesBacklog: number
}

export interface IGDBGame {
  id: number
  name: string
  cover?: {
    id: number
    url: string
  }
  summary?: string
  genres?: Array<{ id: number; name: string }>
  release_dates?: Array<{ date: number }>
  rating?: number
  platforms?: Array<{ id: number; name: string }>
}

export interface SteamGame {
  appid: number
  name: string
  header_image?: string
  short_description?: string
  genres?: Array<{ id: string; description: string }>
  release_date?: {
    date: string
  }
}

export interface ExternalGameData {
  title: string
  coverUrl: string
  description?: string
  genres?: string[]
  releaseDate?: string
  platforms?: string[]
  developer?: string
  publisher?: string
  source: "steam" | "igdb"
  externalId: string | number
}
