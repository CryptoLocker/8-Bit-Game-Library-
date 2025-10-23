import Image from "next/image"
import Link from "next/link"
import { Star, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Game } from "@/lib/types"

interface TopGamesListProps {
  games: Game[]
  sortBy: "rating" | "hours"
}

export function TopGamesList({ games, sortBy }: TopGamesListProps) {
  const sortedGames = [...games]
    .filter((g) => (sortBy === "rating" ? g.rating : true))
    .sort((a, b) => {
      if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0)
      }
      return b.hoursPlayed - a.hoursPlayed
    })
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {sortBy === "rating" ? (
            <>
              <Star className="h-5 w-5 text-secondary" />
              Top Rated Games
            </>
          ) : (
            <>
              <Clock className="h-5 w-5 text-primary" />
              Most Played Games
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedGames.map((game, index) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {index + 1}
              </div>

              <div className="w-12 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                <Image
                  src={game.coverUrl || "/placeholder.svg"}
                  alt={game.title}
                  width={48}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {game.title}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                  {sortBy === "rating" && game.rating && (
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="h-3 w-3 text-secondary fill-secondary" />
                      <span className="text-muted-foreground">{game.rating}/5</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3 text-primary" />
                    <span className="text-muted-foreground">{game.hoursPlayed}h</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
