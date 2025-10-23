import type { Game } from "./types"

interface StatsData {
  totalGames: number
  completedGames: number
  totalHours: number
  averageRating: number
  currentlyPlaying: number
  backlogCount: number
  completionRate: number
  games: Game[]
  period: string
}

export function exportStatsToPDF(stats: StatsData) {
  // Create a printable HTML document
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    alert("Please allow popups to export PDF")
    return
  }

  const periodLabel = {
    all: "All Time",
    month: "Last Month",
    quarter: "Last Quarter",
    year: "Last Year",
  }[stats.period]

  // Genre statistics
  const genreCounts: Record<string, number> = {}
  stats.games.forEach((game) => {
    if (game.genres && game.genres.length > 0) {
      game.genres.forEach((genre) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1
      })
    }
  })
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Platform statistics
  const platformCounts: Record<string, number> = {}
  stats.games.forEach((game) => {
    if (game.platforms && game.platforms.length > 0) {
      game.platforms.forEach((platform) => {
        platformCounts[platform] = (platformCounts[platform] || 0) + 1
      })
    }
  })
  const topPlatforms = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Top games
  const topRatedGames = [...stats.games]
    .filter((g) => g.rating)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5)

  const mostPlayedGames = [...stats.games].sort((a, b) => b.hoursPlayed - a.hoursPlayed).slice(0, 5)

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Gaming Statistics - ${periodLabel}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 40px;
            color: #1a1a1a;
            line-height: 1.6;
          }
          h1 { font-size: 32px; margin-bottom: 8px; color: #0066cc; }
          h2 { font-size: 24px; margin: 32px 0 16px; color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 8px; }
          h3 { font-size: 18px; margin: 24px 0 12px; color: #555; }
          .header { margin-bottom: 40px; }
          .subtitle { color: #666; font-size: 14px; margin-bottom: 4px; }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 24px 0;
          }
          .stat-card {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            background: #f9f9f9;
          }
          .stat-value { font-size: 32px; font-weight: bold; color: #0066cc; margin: 8px 0; }
          .stat-label { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
          .stat-desc { font-size: 12px; color: #999; margin-top: 4px; }
          .game-list { list-style: none; }
          .game-item {
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .game-item:last-child { border-bottom: none; }
          .game-title { font-weight: 600; color: #333; }
          .game-meta { color: #666; font-size: 14px; }
          .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin: 24px 0; }
          .list-item { padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
          @media print {
            body { padding: 20px; }
            .stats-grid { page-break-inside: avoid; }
            h2 { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Gaming Statistics Report</h1>
          <div class="subtitle">Period: ${periodLabel}</div>
          <div class="subtitle">Generated: ${new Date().toLocaleDateString()}</div>
        </div>

        <h2>Overview</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Games</div>
            <div class="stat-value">${stats.totalGames}</div>
            <div class="stat-desc">In your library</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Completed</div>
            <div class="stat-value">${stats.completedGames}</div>
            <div class="stat-desc">${stats.completionRate.toFixed(0)}% completion rate</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Hours</div>
            <div class="stat-value">${stats.totalHours}h</div>
            <div class="stat-desc">Time invested</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Avg Rating</div>
            <div class="stat-value">${stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A"}</div>
            <div class="stat-desc">Your average score</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Currently Playing</div>
            <div class="stat-value">${stats.currentlyPlaying}</div>
            <div class="stat-desc">Active games</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Backlog</div>
            <div class="stat-value">${stats.backlogCount}</div>
            <div class="stat-desc">Games to play</div>
          </div>
        </div>

        <div class="two-column">
          <div>
            <h3>Top Genres</h3>
            ${topGenres.map(([genre, count]) => `<div class="list-item">${genre}: <strong>${count} games</strong></div>`).join("")}
          </div>
          <div>
            <h3>Top Platforms</h3>
            ${topPlatforms.map(([platform, count]) => `<div class="list-item">${platform}: <strong>${count} games</strong></div>`).join("")}
          </div>
        </div>

        <h2>Top Rated Games</h2>
        <ul class="game-list">
          ${topRatedGames
            .map(
              (game) => `
            <li class="game-item">
              <div>
                <div class="game-title">${game.title}</div>
                <div class="game-meta">${game.genres?.join(", ") || "No genres"}</div>
              </div>
              <div class="game-meta">
                ⭐ ${game.rating}/5 • ${game.hoursPlayed}h played
              </div>
            </li>
          `,
            )
            .join("")}
        </ul>

        <h2>Most Played Games</h2>
        <ul class="game-list">
          ${mostPlayedGames
            .map(
              (game) => `
            <li class="game-item">
              <div>
                <div class="game-title">${game.title}</div>
                <div class="game-meta">${game.genres?.join(", ") || "No genres"}</div>
              </div>
              <div class="game-meta">
                ${game.hoursPlayed}h played${game.rating ? ` • ⭐ ${game.rating}/5` : ""}
              </div>
            </li>
          `,
            )
            .join("")}
        </ul>
      </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()

  // Wait for content to load then trigger print
  printWindow.onload = () => {
    printWindow.print()
  }
}
