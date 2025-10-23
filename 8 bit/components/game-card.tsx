"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Clock, CheckCircle2, PlayCircle, MoreVertical, Pencil, Trash2, Calendar, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type GameStatus = "playing" | "completed" | "backlog"

export interface Game {
  id: string
  title: string
  coverUrl: string
  status: GameStatus
  hoursPlayed: number
  rating?: number
  genres?: string[]
  releaseDate?: string
  description?: string
  source?: "steam" | "igdb" | "manual"
  isNew?: boolean
}

interface GameCardProps {
  game: Game
  onEdit?: (game: Game) => void
  onDelete?: (gameId: string) => void
}

const statusConfig = {
  playing: {
    label: "Playing",
    icon: PlayCircle,
    className: "bg-primary/20 text-primary border-primary/50",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-secondary/20 text-secondary border-secondary/50",
  },
  backlog: {
    label: "Backlog",
    icon: Clock,
    className: "bg-muted text-muted-foreground border-border",
  },
}

export function GameCard({ game, onEdit, onDelete }: GameCardProps) {
  const [imageError, setImageError] = useState(false)
  const statusInfo = statusConfig[game.status]
  const StatusIcon = statusInfo.icon

  return (
    <Card
      className={cn(
        "group overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 hover:scale-[1.02]",
        game.isNew &&
          "animate-in fade-in slide-in-from-bottom-4 duration-700 border-primary shadow-lg shadow-primary/30",
      )}
    >
      <Link href={`/games/${game.id}`} className="w-full h-full">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {!imageError ? (
            <Image
              src={game.coverUrl || "/placeholder.svg"}
              alt={game.title}
              fill
              className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out" />

          {game.isNew && (
            <div className="absolute top-2 left-2 z-10">
              <Badge className="bg-primary text-primary-foreground border-0 shadow-lg animate-pulse">
                <Sparkles className="h-3 w-3 mr-1" />
                New
              </Badge>
            </div>
          )}

          <div
            className="absolute top-2 right-2 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out delay-100"
            onClick={(e) => e.preventDefault()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all duration-200 hover:scale-110"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(game)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(game.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div
            className={cn(
              "absolute transition-all duration-300 ease-out group-hover:scale-110",
              game.isNew ? "top-12 left-2" : "top-2 left-2",
            )}
          >
            <Badge variant="outline" className={cn("border transition-all duration-300", statusInfo.className)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-all duration-300 ease-out text-pretty group-hover:translate-x-1">
          {game.title}
        </h3>

        {(game.genres || game.releaseDate) && (
          <div className="mb-2 space-y-1 transition-all duration-300 ease-out group-hover:translate-x-1 delay-75">
            {game.genres && game.genres.length > 0 && (
              <p className="text-xs text-muted-foreground line-clamp-1">{game.genres.slice(0, 2).join(", ")}</p>
            )}
            {game.releaseDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{game.releaseDate}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground transition-all duration-300 ease-out group-hover:translate-x-1 delay-100">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12" />
            <span>{game.hoursPlayed}h played</span>
          </div>

          {game.rating && (
            <div className="flex items-center gap-1">
              <span className="text-secondary transition-transform duration-300 group-hover:scale-125">★</span>
              <span>{game.rating}/5</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
