"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ReviewCard } from "@/components/review-card"
import { ReviewFormDialog } from "@/components/review-form-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { gamesAPI, reviewsAPI } from "@/lib/api-client"
import type { Game, Review } from "@/lib/types"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function ReviewsPage() {
  const { status } = useSession()
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [working, setWorking] = useState(false)

  const fetchData = useCallback(async () => {
    if (status !== "authenticated") {
      return
    }

    try {
      setLoading(true)
      const [gamesData, reviewsData] = await Promise.all([gamesAPI.getAll(), reviewsAPI.getAll()])
      setGames(gamesData)
      setReviews(reviewsData)
      setError(null)
    } catch (err) {
      console.error("Error loading reviews", err)
      setError(err instanceof Error ? err.message : "Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    if (status === "authenticated") {
      void fetchData()
    }
  }, [fetchData, status])

  useEffect(() => {
    const handleGamesUpdated = () => {
      if (!working) {
        void fetchData()
      }
    }

    window.addEventListener("gamesUpdated", handleGamesUpdated)
    window.addEventListener("reviewsUpdated", handleGamesUpdated)

    return () => {
      window.removeEventListener("gamesUpdated", handleGamesUpdated)
      window.removeEventListener("reviewsUpdated", handleGamesUpdated)
    }
  }, [fetchData, working])

  const dispatchReviewChange = useCallback(() => {
    window.dispatchEvent(new Event("reviewsUpdated"))
  }, [])

  const filteredReviews = useMemo(
    () => reviews.filter((review) => review.gameTitle.toLowerCase().includes(searchQuery.toLowerCase())),
    [reviews, searchQuery],
  )

  const handleAddReview = () => {
    setEditingReview(null)
    setIsFormOpen(true)
  }

  const handleEditReview = (review: Review) => {
    setEditingReview(review)
    setIsFormOpen(true)
  }

  const handleSaveReview = useCallback(
    async (reviewData: Omit<Review, "id" | "createdAt"> & { id?: string }) => {
      if (working) return

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
        dispatchReviewChange()
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
    [dispatchReviewChange, toast, working],
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
        dispatchReviewChange()
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
    [dispatchReviewChange, toast, working],
  )

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {status === "unauthenticated" ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-muted-foreground">Inicia sesión para administrar tus reseñas.</p>
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
              <h1 className="text-4xl font-bold mb-2 text-balance">My Reviews</h1>
              <p className="text-muted-foreground text-lg">All your game reviews in one place</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Button onClick={handleAddReview} className="gap-2" disabled={loading || games.length === 0}>
                <Plus className="h-4 w-4" />
                Write Review
              </Button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Spinner className="h-8 w-8" />
                <p className="text-muted-foreground">Loading your reviews...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 space-y-4">
                <p className="text-muted-foreground">{error}</p>
                <button
                  type="button"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  onClick={() => void fetchData()}
                >
                  Try again
                </button>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No reviews found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? "Try adjusting your search" : "Start by writing your first review"}
                </p>
                {!searchQuery && (
                  <Button onClick={handleAddReview} className="gap-2" disabled={games.length === 0}>
                    <Plus className="h-4 w-4" />
                    Write Your First Review
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredReviews.length} {filteredReviews.length === 1 ? "review" : "reviews"}
                </p>
                {filteredReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} onEdit={handleEditReview} onDelete={handleDeleteReview} />
                ))}
              </div>
            )}

            <ReviewFormDialog
              open={isFormOpen}
              onOpenChange={setIsFormOpen}
              review={editingReview}
              games={games}
              onSave={handleSaveReview}
            />
          </>
        )}
      </main>
    </div>
  )
}
