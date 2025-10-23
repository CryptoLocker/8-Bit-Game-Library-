"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { StatCard } from "@/components/stat-card"
import { TopGamesList } from "@/components/top-games-list"
import { StatusBreakdown } from "@/components/status-breakdown"
import { GenreChart } from "@/components/genre-chart"
import { MonthlyActivityChart } from "@/components/monthly-activity-chart"
import { YearInReview } from "@/components/year-in-review"
import { PlatformChart } from "@/components/platform-chart"
import { Gamepad2, Clock, Star, TrendingUp, Trophy, Target, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Game } from "@/lib/types"
import { exportStatsToPDF } from "@/lib/pdf-export"

export default function StatsPage() {
  const [games, setGames] = useState<Game[]>([])
  const [period, setPeriod] = useState<"all" | "month" | "quarter" | "year">("all")

  useEffect(() => {
    const loadGames = () => {
      const storedGames = localStorage.getItem("games")
      if (storedGames) {
        setGames(JSON.parse(storedGames))
      }
    }

    loadGames()

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "games") {
        loadGames()
      }
    }

    // Listen for custom event for same-tab updates
    const handleGamesUpdate = () => {
      loadGames()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("gamesUpdated", handleGamesUpdate)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("gamesUpdated", handleGamesUpdate)
    }
  }, [])

  const filteredGames = games.filter((game) => {
    if (period === "all") return true
    if (!game.createdAt) return false

    const gameDate = new Date(game.createdAt)
    const now = new Date()
    const diffTime = now.getTime() - gameDate.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)

    switch (period) {
      case "month":
        return diffDays <= 30
      case "quarter":
        return diffDays <= 90
      case "year":
        return diffDays <= 365
      default:
        return true
    }
  })

  const totalGames = filteredGames.length
  const completedGames = filteredGames.filter((g) => g.status === "completed").length
  const totalHours = filteredGames.reduce((sum, game) => sum + game.hoursPlayed, 0)
  const gamesWithRatings = filteredGames.filter((g) => g.rating)
  const averageRating =
    gamesWithRatings.length > 0
      ? gamesWithRatings.reduce((sum, game) => sum + (game.rating || 0), 0) / gamesWithRatings.length
      : 0
  const completionRate = totalGames > 0 ? (completedGames / totalGames) * 100 : 0
  const currentlyPlaying = filteredGames.filter((g) => g.status === "playing").length
  const backlogCount = filteredGames.filter((g) => g.status === "backlog").length

  const handleExportPDF = () => {
    exportStatsToPDF({
      totalGames,
      completedGames,
      totalHours,
      averageRating,
      currentlyPlaying,
      backlogCount,
      completionRate,
      games: filteredGames,
      period,
    })
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-balance">Gaming Statistics</h1>
            <p className="text-muted-foreground text-lg">Track your gaming journey with detailed metrics</p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleExportPDF} variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title="Total Games" value={totalGames} icon={Gamepad2} description="In your library" />

            <StatCard
              title="Completed"
              value={completedGames}
              icon={Trophy}
              description={`${completionRate.toFixed(0)}% completion rate`}
            />

            <StatCard title="Total Hours" value={`${totalHours}h`} icon={Clock} description="Time invested" />

            <StatCard
              title="Avg Rating"
              value={averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
              icon={Star}
              description={`From ${gamesWithRatings.length} rated games`}
            />

            <StatCard title="Currently Playing" value={currentlyPlaying} icon={TrendingUp} description="Active games" />

            <StatCard title="Backlog" value={backlogCount} icon={Target} description="Games to play" />
          </div>

          <YearInReview games={filteredGames} />

          {/* Charts and Visualizations */}
          <div className="grid md:grid-cols-2 gap-6">
            <StatusBreakdown games={filteredGames} />
            <GenreChart games={filteredGames} />
          </div>

          <PlatformChart games={filteredGames} />

          <MonthlyActivityChart games={filteredGames} />

          {/* Top Games Lists */}
          <div className="grid md:grid-cols-2 gap-6">
            <TopGamesList games={filteredGames} sortBy="hours" />
            <TopGamesList games={filteredGames} sortBy="rating" />
          </div>
        </div>
      </main>
    </div>
  )
}
