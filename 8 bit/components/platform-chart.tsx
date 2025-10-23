"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Game } from "@/lib/types"

interface PlatformChartProps {
  games: Game[]
}

export function PlatformChart({ games }: PlatformChartProps) {
  const platformData: Record<string, { count: number; hours: number }> = {}

  games.forEach((game) => {
    if (game.platforms && game.platforms.length > 0) {
      game.platforms.forEach((platform) => {
        if (!platformData[platform]) {
          platformData[platform] = { count: 0, hours: 0 }
        }
        platformData[platform].count += 1
        platformData[platform].hours += game.hoursPlayed
      })
    }
  })

  const data = Object.entries(platformData)
    .map(([platform, stats]) => ({
      platform,
      count: stats.count,
      hours: stats.hours,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Games by Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No platform data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Games by Platform</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="platform" className="text-xs" angle={-45} textAnchor="end" height={80} />
            <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
            <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Bar yAxisId="left" dataKey="count" fill="hsl(var(--primary))" name="Games" radius={[8, 8, 0, 0]} />
            <Bar yAxisId="right" dataKey="hours" fill="#10b981" name="Hours" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
