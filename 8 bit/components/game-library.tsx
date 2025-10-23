"use client"

import { useState } from "react"
import { Plus, Search, Filter, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GameCard, type Game, type GameStatus } from "@/components/game-card"

interface GameLibraryProps {
  games: Game[]
  onAddGame?: () => void
  onImportGame?: () => void
  onEditGame?: (game: Game) => void
  onDeleteGame?: (gameId: string) => void
}

export function GameLibrary({ games, onAddGame, onImportGame, onEditGame, onDeleteGame }: GameLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<GameStatus | "all">("all")

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || game.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as GameStatus | "all")}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games</SelectItem>
              <SelectItem value="playing">Playing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="backlog">Backlog</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={onImportGame} variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Import from Steam/IGDB</span>
            <span className="sm:hidden">Import</span>
          </Button>

          <Button onClick={onAddGame} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Game</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {filteredGames.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No games found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Start building your library by adding your first game"}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <div className="flex gap-2 justify-center">
              <Button onClick={onImportGame} variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Import from Steam/IGDB
              </Button>
              <Button onClick={onAddGame} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Manually
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredGames.length} {filteredGames.length === 1 ? "game" : "games"}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} onEdit={onEditGame} onDelete={onDeleteGame} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
