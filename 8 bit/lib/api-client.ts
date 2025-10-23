import type { Game, Review } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

// Generic fetch wrapper with error handling
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An error occurred" }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Games API
export const gamesAPI = {
  getAll: () => fetchAPI<Game[]>("/games"),

  getById: (id: string) => fetchAPI<Game>(`/games/${id}`),

  create: (game: Omit<Game, "id" | "createdAt" | "updatedAt">) =>
    fetchAPI<Game>("/games", {
      method: "POST",
      body: JSON.stringify(game),
    }),

  update: (id: string, game: Partial<Omit<Game, "id" | "createdAt" | "updatedAt">>) =>
    fetchAPI<Game>(`/games/${id}`, {
      method: "PUT",
      body: JSON.stringify(game),
    }),

  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/games/${id}`, {
      method: "DELETE",
    }),
}

// Reviews API
export const reviewsAPI = {
  getAll: () => fetchAPI<Review[]>("/reviews"),

  getByGameId: (gameId: string) => fetchAPI<Review[]>(`/reviews?gameId=${gameId}`),

  create: (review: Omit<Review, "id" | "createdAt" | "updatedAt">) =>
    fetchAPI<Review>("/reviews", {
      method: "POST",
      body: JSON.stringify(review),
    }),

  update: (id: string, review: Partial<Omit<Review, "id" | "createdAt" | "updatedAt">>) =>
    fetchAPI<Review>(`/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(review),
    }),

  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/reviews/${id}`, {
      method: "DELETE",
    }),
}
