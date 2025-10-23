"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Gamepad2, Star, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/library", label: "Library", icon: Gamepad2 },
    { href: "/reviews", label: "Reviews", icon: Star },
    { href: "/stats", label: "Statistics", icon: BarChart3 },
  ]

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/landing" className="flex items-center gap-2 text-xl font-bold">
            <Gamepad2 className="h-6 w-6 text-primary" />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {"8 Bit Game Library"}
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 overflow-hidden",
                    "backdrop-blur-md bg-gradient-to-br shadow-lg",
                    "border border-white/20",
                    "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300",
                    "after:absolute after:inset-0 after:bg-gradient-to-tr after:from-transparent after:via-white/5 after:to-transparent after:translate-x-[-100%] after:transition-transform after:duration-700",
                    "hover:before:opacity-100 hover:after:translate-x-[100%] hover:shadow-xl hover:scale-105",
                    isActive
                      ? "from-primary/40 to-primary/20 text-primary-foreground shadow-primary/50"
                      : "from-muted/30 to-muted/10 text-muted-foreground hover:text-foreground hover:from-muted/50 hover:to-muted/30",
                  )}
                >
                  <Icon className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">{link.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
