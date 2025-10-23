"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { GameLibrary } from "@/components/game-library"
import { GameFormDialog } from "@/components/game-form-dialog"
import { GameSearchDialog } from "@/components/game-search-dialog"
import { useToast } from "@/hooks/use-toast"
import type { Game, ExternalGameData } from "@/lib/types"

// Mock data for demonstration
const mockGames: Game[] = [
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

export default function LibraryPage() {
  const [games, setGames] = useState<Game[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const storedGames = localStorage.getItem("games")
    if (storedGames) {
      setGames(JSON.parse(storedGames))
    } else {
      // Initialize with mock data if no games exist
      setGames(mockGames)
      localStorage.setItem("games", JSON.stringify(mockGames))
    }
  }, [])

  useEffect(() => {
    if (games.length > 0) {
      localStorage.setItem("games", JSON.stringify(games))
    }
  }, [games])

  const isDuplicate = (title: string, externalId?: string | number): boolean => {
    return games.some(
      (game) =>
        game.title.toLowerCase() === title.toLowerCase() ||
        (externalId && game.externalId && game.externalId === externalId),
    )
  }

  const handleAddGame = () => {
    setEditingGame(null)
    setIsFormOpen(true)
  }

  const handleEditGame = (game: Game) => {
    setEditingGame(game)
    setIsFormOpen(true)
  }

  const updateGamesAndNotify = (newGames: Game[]) => {
    setGames(newGames)
    localStorage.setItem("games", JSON.stringify(newGames))
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("gamesUpdated"))
  }

  const handleSaveGame = (gameData: Omit<Game, "id"> & { id?: string }) => {
    if (gameData.id) {
      // Edit existing game
      const updatedGames = games.map((g) =>
        g.id === gameData.id ? { ...gameData, id: gameData.id, updatedAt: new Date().toISOString() } : g,
      )
      updateGamesAndNotify(updatedGames)
      toast({
        title: "Game updated",
        description: `${gameData.title} has been updated successfully`,
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

      const newGame: Game = {
        ...gameData,
        id: Date.now().toString(),
        isNew: true,
        createdAt: new Date().toISOString(),
      }
      updateGamesAndNotify([newGame, ...games])

      setTimeout(() => {
        const currentGames = JSON.parse(localStorage.getItem("games") || "[]")
        const updatedGames = currentGames.map((g: Game) => (g.id === newGame.id ? { ...g, isNew: false } : g))
        updateGamesAndNotify(updatedGames)
      }, 5000)

      toast({
        title: "Game added",
        description: `${gameData.title} has been added to your library`,
      })
    }
  }

  const handleDeleteGame = (gameId: string) => {
    const gameToDelete = games.find((g) => g.id === gameId)
    updateGamesAndNotify(games.filter((g) => g.id !== gameId))
    if (gameToDelete) {
      toast({
        title: "Game deleted",
        description: `${gameToDelete.title} has been removed from your library`,
      })
    }
  }

  const handleImportGame = () => {
    setIsSearchOpen(true)
  }

  const handleSelectExternalGame = (externalGame: ExternalGameData) => {
    if (isDuplicate(externalGame.title, externalGame.externalId)) {
      toast({
        title: "Duplicate game",
        description: `${externalGame.title} is already in your library`,
        variant: "destructive",
      })
      setIsSearchOpen(false)
      return
    }

    const newGame: Game = {
      id: Date.now().toString(),
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
      createdAt: new Date().toISOString(),
    }
    updateGamesAndNotify([newGame, ...games])
    setIsSearchOpen(false)

    setTimeout(() => {
      const currentGames = JSON.parse(localStorage.getItem("games") || "[]")
      const updatedGames = currentGames.map((g: Game) => (g.id === newGame.id ? { ...g, isNew: false } : g))
      updateGamesAndNotify(updatedGames)
    }, 5000)

    toast({
      title: "Game imported successfully",
      description: `${externalGame.title} has been added to your library`,
    })
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-balance">My Game Library</h1>
          <p className="text-muted-foreground text-lg">Manage your collection and track your progress</p>
        </div>

        <GameLibrary
          games={games}
          onAddGame={handleAddGame}
          onImportGame={handleImportGame}
          onEditGame={handleEditGame}
          onDeleteGame={handleDeleteGame}
        />

        <GameFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} game={editingGame} onSave={handleSaveGame} />

        <GameSearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} onSelectGame={handleSelectExternalGame} />
      </main>
    </div>
  )
}
