"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { Game } from "@/lib/types"

interface MonthlyActivityChartProps {
  games: Game[]
}

export function MonthlyActivityChart({ games }: MonthlyActivityChartProps) {
  const monthlyData: Record<string, { completed: number; added: number }> = {}

  games.forEach((game) => {
    if (game.createdAt) {
      const date = new Date(game.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { completed: 0, added: 0 }
      }

      monthlyData[monthKey].added += 1

      if (game.status === "completed") {
        monthlyData[monthKey].completed += 1
      }
    }
  })

  const data = Object.entries(monthlyData)
    .map(([month, counts]) => {
      const [year, monthNum] = month.split("-")
      const date = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1)
      const monthName = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

      return {
        month: monthName,
        completed: counts.completed,
        added: counts.added,
      }
    })
    .sort((a, b) => {
      const dateA = new Date(a.month)
      const dateB = new Date(b.month)
      return dateA.getTime() - dateB.getTime()
    })
    .slice(-12)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No activity data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            
            <Bar dataKey="added" fill="#FF61F7" name="Games Added" radius={[8, 8, 0, 0]} />
            <Bar dataKey="added" fill="hsl(varFF61F7)" name="Games Added" radius={[8, 8, 0, 0]} />
            <Bar dataKey="completed" fill="#10b981" name="Games Completed" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
