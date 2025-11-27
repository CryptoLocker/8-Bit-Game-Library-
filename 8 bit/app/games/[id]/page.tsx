"use client"

import { useCallback, useEffect, useState } from "react"
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
import { Spinner } from "@/components/ui/spinner"
import type { Game, Review } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CheckCircle2, PlayCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { gamesAPI, reviewsAPI } from "@/lib/api-client"
import { useSession } from "next-auth/react"
import Link from "next/link"

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
  const { status } = useSession()
  const { toast } = useToast()
  const [game, setGame] = useState<Game | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)
  const [isEditGameOpen, setIsEditGameOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [working, setWorking] = useState(false)

  const fetchGameData = useCallback(async () => {
    if (status !== "authenticated") {
      return
    }

    try {
      setLoading(true)
      const [gameData, reviewsData] = await Promise.all([gamesAPI.getById(params.id), reviewsAPI.getByGameId(params.id)])
      setGame(gameData)
      setReviews(reviewsData)
      setError(null)
    } catch (err) {
      console.error("Error loading game detail", err)
      const message = err instanceof Error ? err.message : "Failed to load game"
      setError(message)
      toast({
        title: "Unable to load game",
        description: message,
        variant: "destructive",
      })
      router.push("/library")
    } finally {
      setLoading(false)
    }
  }, [params.id, router, status, toast])

  useEffect(() => {
    if (status === "authenticated") {
      void fetchGameData()
    }
  }, [fetchGameData, status])

  const dispatchGamesUpdated = useCallback(() => {
    window.dispatchEvent(new Event("gamesUpdated"))
  }, [])

  const dispatchReviewsUpdated = useCallback(() => {
    window.dispatchEvent(new Event("reviewsUpdated"))
  }, [])

  const handleAddReview = () => {
    setEditingReview(null)
    setIsReviewFormOpen(true)
  }

  const handleEditReview = (review: Review) => {
    setEditingReview(review)
    setIsReviewFormOpen(true)
  }

  const handleSaveReview = useCallback(
    async (reviewData: Omit<Review, "id" | "createdAt"> & { id?: string }) => {
      if (working || !game) return

      try {
        setWorking(true)
        if (reviewData.id) {
          const { id, ...payload } = reviewData
          const updated = await reviewsAPI.update(id, payload)
          setReviews((prev) => prev.map((review) => (review.id === updated.id ? updated : review)))
          toast({
            title: "Review updated",
            description: "Your review has been updated successfully.",
          })
        } else {
          const created = await reviewsAPI.create(reviewData)
          setReviews((prev) => [created, ...prev])
          toast({
            title: "Review added",
            description: "Your review has been added successfully.",
          })
        }
        dispatchReviewsUpdated()
      } catch (err) {
        console.error("Error saving review", err)
        toast({
          title: "Something went wrong",
          description: err instanceof Error ? err.message : "Failed to save review",
          variant: "destructive",
        })
      } finally {
        setWorking(false)
      }
    },
    [dispatchReviewsUpdated, game, toast, working],
  )

  const handleDeleteReview = useCallback(
    async (reviewId: string) => {
      if (working) return

      try {
        setWorking(true)
  await reviewsAPI.delete(reviewId)
        setReviews((prev) => prev.filter((review) => review.id !== reviewId))
        toast({
          title: "Review deleted",
          description: "Your review has been deleted successfully.",
        })
        dispatchReviewsUpdated()
      } catch (err) {
        console.error("Error deleting review", err)
        toast({
          title: "Something went wrong",
          description: err instanceof Error ? err.message : "Failed to delete review",
          variant: "destructive",
        })
      } finally {
        setWorking(false)
      }
    },
    [dispatchReviewsUpdated, toast, working],
  )

  const handleUpdateGame = useCallback(
    async (gameData: Omit<Game, "id"> & { id?: string }) => {
      if (!gameData.id || working) return

      try {
        setWorking(true)
        const { id, ...payload } = gameData
        const updated = await gamesAPI.update(id, payload)
        setGame(updated)
        toast({
          title: "Game updated",
          description: "Game information has been updated successfully.",
        })
        dispatchGamesUpdated()
      } catch (err) {
        console.error("Error updating game", err)
        toast({
          title: "Something went wrong",
          description: err instanceof Error ? err.message : "Failed to update game",
          variant: "destructive",
        })
      } finally {
        setWorking(false)
      }
    },
    [dispatchGamesUpdated, toast, working],
  )

  if (status === "loading") {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spinner className="h-8 w-8" />
            <p className="text-muted-foreground">Verificando sesión...</p>
          </div>
        </main>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-muted-foreground">Inicia sesión para ver el detalle del juego.</p>
            <Link href="/auth/login" className="text-primary underline-offset-4 hover:underline">
              Ir al inicio de sesión
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spinner className="h-8 w-8" />
            <p className="text-muted-foreground">Loading game...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!game || error) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4 py-20">
            <p className="text-muted-foreground">{error ?? "Game not found."}</p>
            <Button onClick={() => router.push("/library")} variant="outline">
              Back to Library
            </Button>
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
