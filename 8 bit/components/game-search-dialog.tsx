"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, Download, Gamepad2, AlertCircle } from "lucide-react"
import type { ExternalGameData } from "@/lib/types"

interface GameSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectGame: (game: ExternalGameData) => void
}

export function GameSearchDialog({ open, onOpenChange, onSelectGame }: GameSearchDialogProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ExternalGameData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiErrors, setApiErrors] = useState<{ source: string; message: string }[]>([])

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setApiErrors([])

    try {
      const response = await fetch(`/api/external-games/search?q=${encodeURIComponent(query)}`)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || "Search failed")
      }

      setResults(data.results || [])
      if (data.errors && data.errors.length > 0) {
        setApiErrors(data.errors)
      }

      if (!data.hasResults && data.errors && data.errors.length > 0) {
        setError("Could not search any game databases. Please check your API credentials.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search games")
      console.error("[v0] Search error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-primary" />
            Search Steam & IGDB
          </DialogTitle>
          <DialogDescription>
            Search for games from Steam and IGDB databases to automatically import game information with cover art,
            genres, and release dates
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            placeholder="Search for a game... (e.g., Elden Ring, Zelda)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading || !query.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Search Failed</p>
                <p className="mt-1">{error}</p>
                <p className="mt-2 text-xs opacity-90">
                  Go to <strong>Project Settings → Environment Variables</strong> and verify:
                </p>
                <ul className="mt-1 text-xs opacity-90 list-disc list-inside space-y-0.5">
                  <li>IGDB_CLIENT_ID and IGDB_CLIENT_SECRET are set</li>
                  <li>STEAM_API_KEY is set</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {apiErrors.length > 0 && !error && (
          <div className="text-sm text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 p-3 rounded-md border border-yellow-500/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Some sources unavailable</p>
                {apiErrors.map((err, idx) => (
                  <p key={idx} className="mt-1 text-xs">
                    <strong>{err.source}:</strong> {err.message}
                  </p>
                ))}
                <p className="mt-2 text-xs opacity-90">
                  Showing results from available sources. Check environment variables to enable all sources.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2 min-h-[300px]">
          {results.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <Gamepad2 className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {query ? "No results found. Try a different search term." : "Enter a game title to search"}
              </p>
              {!query && (
                <p className="text-xs text-muted-foreground mt-2">
                  Search across Steam and IGDB databases for accurate game information
                </p>
              )}
            </div>
          )}

          {results.map((game, index) => (
            <div
              key={`${game.source}-${game.externalId}-${index}`}
              className="flex gap-4 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
            >
              <img
                src={game.coverUrl || "/placeholder.svg"}
                alt={game.title}
                className="w-20 h-28 object-cover rounded"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=112&width=80"
                }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{game.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      game.source === "steam" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
                    }`}
                  >
                    {game.source.toUpperCase()}
                  </span>
                  {game.releaseDate && <span className="text-xs text-muted-foreground">{game.releaseDate}</span>}
                </div>
                {game.genres && game.genres.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">{game.genres.slice(0, 3).join(", ")}</p>
                )}
                {game.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{game.description}</p>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => {
                  onSelectGame(game)
                  onOpenChange(false)
                }}
                className="shrink-0"
              >
                <Download className="h-4 w-4 mr-1" />
                Import
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
