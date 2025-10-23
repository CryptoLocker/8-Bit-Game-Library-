"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Review } from "@/components/review-card"
import type { Game } from "@/components/game-card"
import { cn } from "@/lib/utils"

interface ReviewFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  review?: Review | null
  games: Game[]
  onSave: (review: Omit<Review, "id" | "createdAt"> & { id?: string }) => void
}

export function ReviewFormDialog({ open, onOpenChange, review, games, onSave }: ReviewFormDialogProps) {
  const [formData, setFormData] = useState({
    gameId: "",
    rating: 0,
    content: "",
  })
  const [hoveredRating, setHoveredRating] = useState(0)

  useEffect(() => {
    if (review) {
      setFormData({
        gameId: review.gameId,
        rating: review.rating,
        content: review.content,
      })
    } else {
      setFormData({
        gameId: "",
        rating: 0,
        content: "",
      })
    }
  }, [review, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedGame = games.find((g) => g.id === formData.gameId)
    if (!selectedGame) return

    onSave({
      ...formData,
      gameTitle: selectedGame.title,
      gameCover: selectedGame.coverUrl,
      id: review?.id,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{review ? "Edit Review" : "Write a Review"}</DialogTitle>
            <DialogDescription>
              {review ? "Update your review for this game." : "Share your thoughts about a game."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="game">
                Game <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.gameId}
                onValueChange={(value) => setFormData({ ...formData, gameId: value })}
                disabled={!!review}
              >
                <SelectTrigger id="game">
                  <SelectValue placeholder="Select a game" />
                </SelectTrigger>
                <SelectContent>
                  {games.map((game) => (
                    <SelectItem key={game.id} value={game.id}>
                      {game.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>
                Rating <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const starValue = i + 1
                  const isActive = starValue <= (hoveredRating || formData.rating)
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: starValue })}
                      onMouseEnter={() => setHoveredRating(starValue)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "h-8 w-8 transition-colors",
                          isActive ? "fill-secondary text-secondary" : "text-muted-foreground",
                        )}
                      />
                    </button>
                  )
                })}
                {formData.rating > 0 && (
                  <span className="ml-2 text-sm text-muted-foreground">{formData.rating} / 5</span>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">
                Review <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="content"
                placeholder="Share your thoughts about this game..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground">{formData.content.length} characters</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.gameId || formData.rating === 0 || !formData.content.trim()}>
              {review ? "Save Changes" : "Post Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
