"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search } from "lucide-react"
import type { Game, GameStatus, ExternalGameData } from "@/lib/types"
import { GameSearchDialog } from "./game-search-dialog"

interface GameFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  game?: Game | null
  onSave: (game: Omit<Game, "id"> & { id?: string }) => void
}

export function GameFormDialog({ open, onOpenChange, game, onSave }: GameFormDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    coverUrl: "",
    status: "backlog" as GameStatus,
    hoursPlayed: 0,
    rating: undefined as number | undefined,
    genres: [] as string[],
    releaseDate: "",
    description: "",
    platforms: [] as string[],
    developer: "",
    publisher: "",
  })
  const [searchOpen, setSearchOpen] = useState(false)
  const [genreInput, setGenreInput] = useState("")
  const [platformInput, setPlatformInput] = useState("")

  useEffect(() => {
    if (game) {
      setFormData({
        title: game.title,
        coverUrl: game.coverUrl,
        status: game.status,
        hoursPlayed: game.hoursPlayed,
        rating: game.rating,
        genres: game.genres || [],
        releaseDate: game.releaseDate || "",
        description: game.description || "",
        platforms: game.platforms || [],
        developer: game.developer || "",
        publisher: game.publisher || "",
      })
    } else {
      setFormData({
        title: "",
        coverUrl: "",
        status: "backlog",
        hoursPlayed: 0,
        rating: undefined,
        genres: [],
        releaseDate: "",
        description: "",
        platforms: [],
        developer: "",
        publisher: "",
      })
    }
  }, [game, open])

  const handleImportGame = (externalGame: ExternalGameData) => {
    setFormData({
      ...formData,
      title: externalGame.title,
      coverUrl: externalGame.coverUrl,
      genres: externalGame.genres || [],
      releaseDate: externalGame.releaseDate || "",
      description: externalGame.description || "",
      platforms: externalGame.platforms || [],
      developer: externalGame.developer || "",
      publisher: externalGame.publisher || "",
    })
  }

  const handleAddGenre = () => {
    if (genreInput.trim() && !formData.genres.includes(genreInput.trim())) {
      setFormData({ ...formData, genres: [...formData.genres, genreInput.trim()] })
      setGenreInput("")
    }
  }

  const handleRemoveGenre = (genre: string) => {
    setFormData({ ...formData, genres: formData.genres.filter((g) => g !== genre) })
  }

  const handleAddPlatform = () => {
    if (platformInput.trim() && !formData.platforms.includes(platformInput.trim())) {
      setFormData({ ...formData, platforms: [...formData.platforms, platformInput.trim()] })
      setPlatformInput("")
    }
  }

  const handleRemovePlatform = (platform: string) => {
    setFormData({ ...formData, platforms: formData.platforms.filter((p) => p !== platform) })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      id: game?.id,
    })
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{game ? "Edit Game" : "Add New Game"}</DialogTitle>
              <DialogDescription>
                {game ? "Update the details of your game." : "Add a new game to your library. All fields are required."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {!game && (
                <Button type="button" variant="outline" onClick={() => setSearchOpen(true)} className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Search Steam & IGDB (Recommended)
                </Button>
              )}

              <div className="grid gap-2">
                <Label htmlFor="title">
                  Game Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter game title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="coverUrl">
                  Cover Image URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="coverUrl"
                  type="url"
                  placeholder="https://example.com/cover.jpg"
                  value={formData.coverUrl}
                  onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter game description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="developer">
                    Developer <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="developer"
                    placeholder="e.g., FromSoftware"
                    value={formData.developer}
                    onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="publisher">
                    Publisher <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="publisher"
                    placeholder="e.g., Bandai Namco"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="releaseDate">
                  Release Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="releaseDate"
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>
                  Genres <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add genre (e.g., RPG, Action)"
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddGenre())}
                  />
                  <Button type="button" onClick={handleAddGenre} variant="outline">
                    Add
                  </Button>
                </div>
                {formData.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.genres.map((genre) => (
                      <span
                        key={genre}
                        className="bg-primary/20 text-primary px-2 py-1 rounded-md text-sm flex items-center gap-1"
                      >
                        {genre}
                        <button
                          type="button"
                          onClick={() => handleRemoveGenre(genre)}
                          className="hover:text-destructive"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {formData.genres.length === 0 && (
                  <p className="text-xs text-muted-foreground">At least one genre is required</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>
                  Platforms <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add platform (e.g., PC, PS5)"
                    value={platformInput}
                    onChange={(e) => setPlatformInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddPlatform())}
                  />
                  <Button type="button" onClick={handleAddPlatform} variant="outline">
                    Add
                  </Button>
                </div>
                {formData.platforms.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="bg-secondary/20 text-secondary px-2 py-1 rounded-md text-sm flex items-center gap-1"
                      >
                        {platform}
                        <button
                          type="button"
                          onClick={() => handleRemovePlatform(platform)}
                          className="hover:text-destructive"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {formData.platforms.length === 0 && (
                  <p className="text-xs text-muted-foreground">At least one platform is required</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as GameStatus })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backlog">Backlog</SelectItem>
                      <SelectItem value="playing">Playing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="hoursPlayed">
                    Hours Played <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="hoursPlayed"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.hoursPlayed}
                    onChange={(e) => setFormData({ ...formData, hoursPlayed: Number.parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="rating">
                  Rating (1-5) <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.rating?.toString() || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, rating: value ? Number.parseInt(value) : undefined })
                  }
                  required
                >
                  <SelectTrigger id="rating">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">★ 1 - Poor</SelectItem>
                    <SelectItem value="2">★★ 2 - Fair</SelectItem>
                    <SelectItem value="3">★★★ 3 - Good</SelectItem>
                    <SelectItem value="4">★★★★ 4 - Great</SelectItem>
                    <SelectItem value="5">★★★★★ 5 - Masterpiece</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !formData.title ||
                  !formData.coverUrl ||
                  !formData.description ||
                  !formData.developer ||
                  !formData.publisher ||
                  !formData.releaseDate ||
                  formData.genres.length === 0 ||
                  formData.platforms.length === 0 ||
                  !formData.rating
                }
              >
                {game ? "Save Changes" : "Add Game"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <GameSearchDialog open={searchOpen} onOpenChange={setSearchOpen} onSelectGame={handleImportGame} />
    </>
  )
}
