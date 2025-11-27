"use client"

import { useCallback, useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { GameLibrary } from "@/components/game-library"
import { GameFormDialog } from "@/components/game-form-dialog"
import { GameSearchDialog } from "@/components/game-search-dialog"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { gamesAPI } from "@/lib/api-client"
import type { ExternalGameData, Game } from "@/lib/types"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function LibraryPage() {
  const { status } = useSession()
  const { toast } = useToast()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [working, setWorking] = useState(false)

  const fetchGames = useCallback(async () => {
    if (status !== "authenticated") {
      return
    }

    try {
      setLoading(true)
      const data = await gamesAPI.getAll()
      setGames(data)
      setError(null)
    } catch (err) {
      console.error("Error loading games", err)
      setError(err instanceof Error ? err.message : "Failed to load games")
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    if (status === "authenticated") {
      void fetchGames()
    }
  }, [fetchGames, status])

  useEffect(() => {
    const handleGamesUpdated = () => {
      if (!working) {
        void fetchGames()
      }
    }

    window.addEventListener("gamesUpdated", handleGamesUpdated)
    return () => window.removeEventListener("gamesUpdated", handleGamesUpdated)
  }, [fetchGames, working])

  const dispatchGamesUpdated = useCallback(() => {
    window.dispatchEvent(new Event("gamesUpdated"))
  }, [])

  const isDuplicate = useCallback(
    (title: string, externalId?: string | number): boolean => {
      const normalizedTitle = title.trim().toLowerCase()
      return games.some((game) => {
        const matchesTitle = game.title.trim().toLowerCase() === normalizedTitle
        const matchesExternalId = Boolean(externalId && game.externalId && game.externalId === externalId)
        return matchesTitle || matchesExternalId
      })
    },
    [games],
  )

  const handleAddGame = () => {
    setEditingGame(null)
    setIsFormOpen(true)
  }

  const handleEditGame = (game: Game) => {
    setEditingGame(game)
    setIsFormOpen(true)
  }

  const notifyError = useCallback(
    (message: string) => {
      toast({
        title: "Something went wrong",
        description: message,
        variant: "destructive",
      })
    },
    [toast],
  )

  const markGameAsNotNew = useCallback(async (gameId: string) => {
    try {
      const updated = await gamesAPI.update(gameId, { isNew: false })
      setGames((prev) => prev.map((game) => (game.id === gameId ? updated : game)))
      dispatchGamesUpdated()
    } catch (err) {
      console.error("Failed to clear new flag", err)
    }
  }, [dispatchGamesUpdated])

  const handleSaveGame = useCallback(
    async (gameData: Omit<Game, "id"> & { id?: string }) => {
      if (working) return

      try {
        setWorking(true)

        if (gameData.id) {
          const { id, ...payload } = gameData
          const updatedGame = await gamesAPI.update(id, payload)
          setGames((prev) => prev.map((game) => (game.id === updatedGame.id ? updatedGame : game)))
          toast({
            title: "Game updated",
            description: `${updatedGame.title} has been updated successfully`,
          })
        } else {
          if (isDuplicate(gameData.title, gameData.externalId)) {
            toast({
              title: "Duplicate game",
              description: `${gameData.title} is already in your library`,
              variant: "destructive",
            })
            return
          }

          const created = await gamesAPI.create({
            ...gameData,
            source: gameData.source || "manual",
            isNew: true,
          })

          setGames((prev) => [created, ...prev])
          toast({
            title: "Game added",
            description: `${created.title} has been added to your library`,
          })

          setTimeout(() => {
            void markGameAsNotNew(created.id)
          }, 5000)
        }

        dispatchGamesUpdated()
      } catch (err) {
        console.error("Error saving game", err)
        notifyError(err instanceof Error ? err.message : "Failed to save game")
      } finally {
        setWorking(false)
      }
    },
    [dispatchGamesUpdated, isDuplicate, markGameAsNotNew, notifyError, toast, working],
  )

  const handleDeleteGame = useCallback(
    async (gameId: string) => {
      if (working) return

      const gameToDelete = games.find((g) => g.id === gameId)
      try {
        setWorking(true)
  await gamesAPI.delete(gameId)
        setGames((prev) => prev.filter((game) => game.id !== gameId))
        if (gameToDelete) {
          toast({
            title: "Game deleted",
            description: `${gameToDelete.title} has been removed from your library`,
          })
        }
        dispatchGamesUpdated()
      } catch (err) {
        console.error("Error deleting game", err)
        notifyError(err instanceof Error ? err.message : "Failed to delete game")
      } finally {
        setWorking(false)
      }
    },
    [dispatchGamesUpdated, games, notifyError, toast, working],
  )

  const handleSelectExternalGame = useCallback(
    async (externalGame: ExternalGameData) => {
      if (isDuplicate(externalGame.title, externalGame.externalId)) {
        toast({
          title: "Duplicate game",
          description: `${externalGame.title} is already in your library`,
          variant: "destructive",
        })
        setIsSearchOpen(false)
        return
      }

      try {
        setWorking(true)
        const created = await gamesAPI.create({
          title: externalGame.title,
          coverUrl: externalGame.coverUrl,
          status: "backlog",
          hoursPlayed: 0,
          rating: undefined,
          genres: externalGame.genres,
          releaseDate: externalGame.releaseDate,
          description: externalGame.description,
          platforms: externalGame.platforms,
          developer: externalGame.developer,
          publisher: externalGame.publisher,
          source: externalGame.source,
          externalId: externalGame.externalId,
          isNew: true,
        })

        setGames((prev) => [created, ...prev])
        setIsSearchOpen(false)
        toast({
          title: "Game imported successfully",
          description: `${created.title} has been added to your library`,
        })

        setTimeout(() => {
          void markGameAsNotNew(created.id)
        }, 5000)

        dispatchGamesUpdated()
      } catch (err) {
        console.error("Error importing game", err)
        notifyError(err instanceof Error ? err.message : "Failed to import game")
      } finally {
        setWorking(false)
      }
    },
    [dispatchGamesUpdated, isDuplicate, markGameAsNotNew, notifyError, toast],
  )

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {status === "unauthenticated" ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-muted-foreground">Inicia sesión para ver tu biblioteca de juegos.</p>
            <Link href="/auth/login" className="text-primary underline-offset-4 hover:underline">
              Ir al inicio de sesión
            </Link>
          </div>
        ) : status === "loading" ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spinner className="h-8 w-8" />
            <p className="text-muted-foreground">Verificando sesión...</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 text-balance">My Game Library</h1>
              <p className="text-muted-foreground text-lg">Manage your collection and track your progress</p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Spinner className="h-8 w-8" />
                <p className="text-muted-foreground">Loading your games...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 space-y-4">
                <p className="text-muted-foreground">{error}</p>
                <button
                  type="button"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  onClick={() => void fetchGames()}
                >
                  Try again
                </button>
              </div>
            ) : (
              <GameLibrary
                games={games}
                onAddGame={handleAddGame}
                onImportGame={() => setIsSearchOpen(true)}
                onEditGame={handleEditGame}
                onDeleteGame={handleDeleteGame}
              />
            )}

            <GameFormDialog
              open={isFormOpen}
              onOpenChange={setIsFormOpen}
              game={editingGame}
              onSave={handleSaveGame}
            />

            <GameSearchDialog
              open={isSearchOpen}
              onOpenChange={setIsSearchOpen}
              onSelectGame={handleSelectExternalGame}
            />
          </>
        )}
      </main>
    </div>
  )
}
