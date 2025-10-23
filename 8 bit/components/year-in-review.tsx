import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Clock, Star, TrendingUp } from "lucide-react"
import Image from "next/image"
import type { Game } from "@/lib/types"

interface YearInReviewProps {
  games: Game[]
}

export function YearInReview({ games }: YearInReviewProps) {
  const currentYear = new Date().getFullYear()

  const thisYearGames = games.filter((game) => {
    if (!game.createdAt) return false
    const gameYear = new Date(game.createdAt).getFullYear()
    return gameYear === currentYear
  })

  const completedThisYear = thisYearGames.filter((g) => g.status === "completed").length
  const totalHoursThisYear = thisYearGames.reduce((sum, game) => sum + game.hoursPlayed, 0)

  const favoriteGame = [...thisYearGames].filter((g) => g.rating).sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]

  const mostPlayedGame = [...thisYearGames]
    .filter((g) => g.hoursPlayed > 0)
    .sort((a, b) => b.hoursPlayed - a.hoursPlayed)[0]

  if (thisYearGames.length === 0) {
    return null
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          {currentYear} Year in Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Games Added</span>
            </div>
            <p className="text-4xl font-bold">{thisYearGames.length}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <p className="text-4xl font-bold">{completedThisYear}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Hours Played</span>
            </div>
            <p className="text-4xl font-bold">{totalHoursThisYear}h</p>
          </div>

          {favoriteGame && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="h-4 w-4" />
                <span className="text-sm font-medium">Favorite Game</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-14 flex-shrink-0 rounded overflow-hidden">
                  <Image
                    src={favoriteGame.coverUrl || "/placeholder.svg"}
                    alt={favoriteGame.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{favoriteGame.title}</p>
                  <p className="text-xs text-muted-foreground">{favoriteGame.rating}/5 stars</p>
                </div>
              </div>
            </div>
          )}

          {mostPlayedGame && !favoriteGame && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Most Played</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-14 flex-shrink-0 rounded overflow-hidden">
                  <Image
                    src={mostPlayedGame.coverUrl || "/placeholder.svg"}
                    alt={mostPlayedGame.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{mostPlayedGame.title}</p>
                  <p className="text-xs text-muted-foreground">{mostPlayedGame.hoursPlayed}h played</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
