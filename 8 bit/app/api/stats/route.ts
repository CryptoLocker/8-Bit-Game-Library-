import { NextRequest, NextResponse } from "next/server"
import { getCollection, Collections } from "@/lib/mongodb"
import type { GameDocument } from "@/lib/types"
import { getSessionUser } from "@/lib/auth"

// GET /api/stats - Obtener estadísticas del usuario
export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const userId = sessionUser.id

    const collection = await getCollection<GameDocument>(Collections.GAMES)

    // Agregación para calcular estadísticas totales
    const statsResult = await collection
      .aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalGames: { $sum: 1 },
            completedGames: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
            playingGames: {
              $sum: { $cond: [{ $eq: ["$status", "playing"] }, 1, 0] },
            },
            backlogGames: {
              $sum: { $cond: [{ $eq: ["$status", "backlog"] }, 1, 0] },
            },
            totalHours: { $sum: "$hoursPlayed" },
            averageRating: { $avg: "$rating" },
          },
        },
      ])
      .toArray()

    // Agregación para estadísticas por género
    const genreStats = await collection
      .aggregate([
        { $match: { userId } },
        { $unwind: "$genres" },
        {
          $group: {
            _id: "$genres",
            count: { $sum: 1 },
            totalHours: { $sum: "$hoursPlayed" },
            avgRating: { $avg: "$rating" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 }, // Top 10 géneros
      ])
      .toArray()

    // Agregación para estadísticas por plataforma
    const platformStats = await collection
      .aggregate([
        { $match: { userId } },
        { $unwind: "$platforms" },
        {
          $group: {
            _id: "$platforms",
            count: { $sum: 1 },
            totalHours: { $sum: "$hoursPlayed" },
          },
        },
        { $sort: { count: -1 } },
      ])
      .toArray()

    // Agregación para juegos mejor valorados
    const topRatedGames = await collection
      .find({ 
        userId, 
        rating: { $exists: true, $ne: null } as any 
      })
      .sort({ rating: -1, hoursPlayed: -1 })
      .limit(10)
      .toArray()

    // Agregación para actividad mensual (últimos 12 meses)
    const monthlyActivity = await collection
      .aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m", date: "$createdAt" },
            },
            gamesAdded: { $sum: 1 },
            hoursPlayed: { $sum: "$hoursPlayed" },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 12 },
      ])
      .toArray()

    const stats = statsResult[0] || {
      totalGames: 0,
      completedGames: 0,
      playingGames: 0,
      backlogGames: 0,
      totalHours: 0,
      averageRating: 0,
    }

    return NextResponse.json({
      overview: {
        totalGames: stats.totalGames,
        completedGames: stats.completedGames,
        playingGames: stats.playingGames,
        backlogGames: stats.backlogGames,
        totalHours: stats.totalHours,
        averageRating: stats.averageRating ? Math.round(stats.averageRating * 10) / 10 : 0,
      },
      genres: genreStats.map((g) => ({
        name: g._id,
        count: g.count,
        totalHours: g.totalHours,
        avgRating: g.avgRating ? Math.round(g.avgRating * 10) / 10 : 0,
      })),
      platforms: platformStats.map((p) => ({
        name: p._id,
        count: p.count,
        totalHours: p.totalHours,
      })),
      topRated: topRatedGames.map((game) => ({
        id: game._id.toString(),
        title: game.title,
        coverUrl: game.coverUrl,
        rating: game.rating,
        hoursPlayed: game.hoursPlayed,
      })),
      monthlyActivity: monthlyActivity.map((m) => ({
        month: m._id,
        gamesAdded: m.gamesAdded,
        hoursPlayed: m.hoursPlayed,
      })),
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { message: "Error fetching stats", error: String(error) },
      { status: 500 }
    )
  }
}
