"use client"

import { useState, useEffect } from "react"
import { Plus, Search } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ReviewCard } from "@/components/review-card"
import { ReviewFormDialog } from "@/components/review-form-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Game, Review } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const reviewsData = localStorage.getItem("reviews")
    const gamesData = localStorage.getItem("games")

    if (reviewsData) {
      const parsedReviews: Review[] = JSON.parse(reviewsData)
      setReviews(parsedReviews)
    }

    if (gamesData) {
      const parsedGames: Game[] = JSON.parse(gamesData)
      setGames(parsedGames)
    }
  }, [])

  const filteredReviews = reviews.filter((review) => review.gameTitle.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleAddReview = () => {
    setEditingReview(null)
    setIsFormOpen(true)
  }

  const handleEditReview = (review: Review) => {
    setEditingReview(review)
    setIsFormOpen(true)
  }

  const handleSaveReview = (reviewData: Omit<Review, "id" | "createdAt"> & { id?: string }) => {
    const reviewsData = localStorage.getItem("reviews")
    const allReviews: Review[] = reviewsData ? JSON.parse(reviewsData) : []

    if (reviewData.id) {
      // Edit existing review
      const updatedReviews = allReviews.map((r) =>
        r.id === reviewData.id
          ? { ...reviewData, id: reviewData.id, createdAt: r.createdAt, updatedAt: new Date().toISOString() }
          : r,
      )
      localStorage.setItem("reviews", JSON.stringify(updatedReviews))
      setReviews(updatedReviews)
      toast({
        title: "Review updated",
        description: "Your review has been updated successfully.",
      })
    } else {
      // Add new review
      const newReview: Review = {
        ...reviewData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      const updatedReviews = [newReview, ...allReviews]
      localStorage.setItem("reviews", JSON.stringify(updatedReviews))
      setReviews(updatedReviews)
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
      setReviews(updatedReviews)
      toast({
        title: "Review deleted",
        description: "Your review has been deleted successfully.",
      })
    }
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
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

          <Button onClick={handleAddReview} className="gap-2">
            <Plus className="h-4 w-4" />
            Write Review
          </Button>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No reviews found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? "Try adjusting your search" : "Start by writing your first review"}
            </p>
            {!searchQuery && (
              <Button onClick={handleAddReview} className="gap-2">
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
      </main>
    </div>
  )
}
