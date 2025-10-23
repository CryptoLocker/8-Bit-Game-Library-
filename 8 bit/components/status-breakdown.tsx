import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PlayCircle, CheckCircle2, Clock } from "lucide-react"
import type { Game } from "@/lib/types"

interface StatusBreakdownProps {
  games: Game[]
}

export function StatusBreakdown({ games }: StatusBreakdownProps) {
  const total = games.length
  const playing = games.filter((g) => g.status === "playing").length
  const completed = games.filter((g) => g.status === "completed").length
  const backlog = games.filter((g) => g.status === "backlog").length

  const stats = [
    {
      label: "Playing",
      count: playing,
      percentage: total > 0 ? (playing / total) * 100 : 0,
      icon: PlayCircle,
      color: "text-primary",
      bgColor: "bg-primary",
    },
    {
      label: "Completed",
      count: completed,
      percentage: total > 0 ? (completed / total) * 100 : 0,
      icon: CheckCircle2,
      color: "text-secondary",
      bgColor: "bg-secondary",
    },
    {
      label: "Backlog",
      count: backlog,
      percentage: total > 0 ? (backlog / total) * 100 : 0,
      icon: Clock,
      color: "text-muted-foreground",
      bgColor: "bg-muted-foreground",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-sm font-medium">{stat.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{stat.count}</span>
                  <span className="text-xs text-muted-foreground">({stat.percentage.toFixed(0)}%)</span>
                </div>
              </div>
              <Progress value={stat.percentage} className="h-2" />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
