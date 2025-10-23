"use client"

import Link from "next/link"
import { ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#F7F7F7] overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2"></div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 z-10">
            <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
              Todo tu catalogo de videojuegos en un solo lugar{" "}
              <span className="bg-gradient-to-r from-[#FF61F7] to-[#00D9FF] bg-clip-text text-transparent">
                8 BIT GAME LIBRARY
              </span>
            </h1>
            <p className="text-xl text-[#F7F7F7]/70 max-w-lg leading-relaxed">{'"Miles de mundos. Un solo lugar."'}</p>
            <Link href="/library">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-br from-[#00D9FF]/20 to-[#FF61F7]/20 backdrop-blur-xl border border-[#00D9FF]/30 hover:border-[#00D9FF]/60 text-[#F7F7F7] px-8 py-6 text-lg rounded-full shadow-[0_0_30px_rgba(0,217,255,0.3)] hover:shadow-[0_0_50px_rgba(0,217,255,0.5)] transition-all duration-500"
              >
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                {/* Glass reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <span className="relative z-10 flex items-center">
                  Sumérgete en la Biblioteca
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </div>

          {/* Right Visual - Game Controller */}
          <div className="relative h-[600px] flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 bg-[#00D9FF]/20 rounded-full blur-3xl animate-pulse" />
            </div>

            <div className="relative z-10 animate-bounce-slow">
              <div className="relative w-[500px] h-[375px] drop-shadow-2xl">
                <Image
                  src="/control.webp"
                  alt="Game Controller"
                  fill
                  className="object-contain"
                  style={{
                    filter: "drop-shadow(0 0 30px rgba(0, 217, 255, 0.6))",
                  }}
                  priority
                />
              </div>
            </div>

            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-[#00D9FF] rounded-full animate-float-particle opacity-40"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-[#00D9FF]" />
        </div>
      </section>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }
        
        @keyframes float-particle {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.4;
          }
          50% {
            transform: translate(20px, -20px);
            opacity: 0.8;
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        
        .animate-float-particle {
          animation: float-particle 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
