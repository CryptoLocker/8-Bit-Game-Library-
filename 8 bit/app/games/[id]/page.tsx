"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import Image from "next/image"
import { Clock, Calendar, Star, Plus, ArrowLeft, Pencil } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ReviewCard } from "@/components/review-card"
import { ReviewFormDialog } from "@/components/review-form-dialog"
import { GameFormDialog } from "@/components/game-form-dialog"
import type { Game, Review } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CheckCircle2, PlayCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const statusConfig = {
  playing: {
    label: "Playing",
    icon: PlayCircle,
    className: "bg-primary/20 text-primary border-primary/50",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-secondary/20 text-secondary border-secondary/50",
  },
  backlog: {
    label: "Backlog",
    icon: Clock,
    className: "bg-muted text-muted-foreground border-border",
  },
}

export default function GameDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [game, setGame] = useState<Game | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)
  const [isEditGameOpen, setIsEditGameOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)

  useEffect(() => {
    const gamesData = localStorage.getItem("games")
    const reviewsData = localStorage.getItem("reviews")

    if (gamesData) {
      const games: Game[] = JSON.parse(gamesData)
      const foundGame = games.find((g) => g.id === params.id)
      if (foundGame) {
        setGame(foundGame)
      } else {
        toast({
          title: "Game not found",
          description: "The game you're looking for doesn't exist.",
          variant: "destructive",
        })
        router.push("/")
      }
    }

    if (reviewsData) {
      const allReviews: Review[] = JSON.parse(reviewsData)
      const gameReviews = allReviews.filter((r) => r.gameId === params.id)
      setReviews(gameReviews)
    }
  }, [params.id, router, toast])

  const handleAddReview = () => {
    setEditingReview(null)
    setIsReviewFormOpen(true)
  }

  const handleEditReview = (review: Review) => {
    setEditingReview(review)
    setIsReviewFormOpen(true)
  }

  const handleSaveReview = (reviewData: Omit<Review, "id" | "createdAt"> & { id?: string }) => {
    const reviewsData = localStorage.getItem("reviews")
    const allReviews: Review[] = reviewsData ? JSON.parse(reviewsData) : []

    if (reviewData.id) {
      const updatedReviews = allReviews.map((r) =>
        r.id === reviewData.id
          ? { ...reviewData, id: reviewData.id, createdAt: r.createdAt, updatedAt: new Date().toISOString() }
          : r,
      )
      localStorage.setItem("reviews", JSON.stringify(updatedReviews))
      setReviews(updatedReviews.filter((r) => r.gameId === params.id))
      toast({
        title: "Review updated",
        description: "Your review has been updated successfully.",
      })
    } else {
      const newReview: Review = {
        ...reviewData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      const updatedReviews = [newReview, ...allReviews]
      localStorage.setItem("reviews", JSON.stringify(updatedReviews))
      setReviews([newReview, ...reviews])
      toast({
        title: "Review added",
        description: "Your review has been added successfully.",
      })
    }
  }

  const handleDeleteReview = (reviewId: string) => {
    const reviewsData = localStorage.getItem("reviews")
    if (reviewsData) {
      const allReviews: Review[] = JSON.parse(reviewsData)
      const updatedReviews = allReviews.filter((r) => r.id !== reviewId)
      localStorage.setItem("reviews", JSON.stringify(updatedReviews))
      setReviews(reviews.filter((r) => r.id !== reviewId))
      toast({
        title: "Review deleted",
        description: "Your review has been deleted successfully.",
      })
    }
  }

  const handleUpdateGame = (updatedGame: Game) => {
    const gamesData = localStorage.getItem("games")
    if (gamesData) {
      const games: Game[] = JSON.parse(gamesData)
      const updatedGames = games.map((g) => (g.id === updatedGame.id ? updatedGame : g))
      localStorage.setItem("games", JSON.stringify(updatedGames))
      setGame(updatedGame)
      toast({
        title: "Game updated",
        description: "Game information has been updated successfully.",
      })
    }
  }

  if (!game) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Loading game...</p>
          </div>
        </main>
      </div>
    )
  }

  const statusInfo = statusConfig[game.status]
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push("/")} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Button>

        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          <div className="space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-border">
              <Image src={game.coverUrl || "/placeholder.svg"} alt={game.title} fill className="object-cover" />
            </div>

            <Button className="w-full gap-2" onClick={() => setIsEditGameOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit Game
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-balance">{game.title}</h1>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="outline" className={cn("border", statusInfo.className)}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusInfo.label}
                </Badge>
                {game.genres && game.genres.length > 0 && (
                  <>
                    {game.genres.slice(0, 3).map((genre) => (
                      <Badge key={genre} variant="secondary">
                        {genre}
                      </Badge>
                    ))}
                  </>
                )}
              </div>

              {game.description && <p className="text-muted-foreground mb-6 leading-relaxed">{game.description}</p>}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Hours Played</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-2xl font-bold">{game.hoursPlayed}h</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Rating</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-secondary fill-secondary" />
                      <span className="text-2xl font-bold">{game.rating || 0}/5</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Date Added</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-lg font-semibold">
                        {game.createdAt ? new Date(game.createdAt).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Reviews</CardTitle>
                <Button size="sm" onClick={handleAddReview} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Review
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No reviews yet. Add your first review!</p>
                ) : (
                  reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onEdit={handleEditReview}
                      onDelete={handleDeleteReview}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <ReviewFormDialog
          open={isReviewFormOpen}
          onOpenChange={setIsReviewFormOpen}
          review={editingReview}
          games={[game]}
          onSave={handleSaveReview}
        />

        <GameFormDialog open={isEditGameOpen} onOpenChange={setIsEditGameOpen} game={game} onSave={handleUpdateGame} />
      </main>
    </div>
  )
}
