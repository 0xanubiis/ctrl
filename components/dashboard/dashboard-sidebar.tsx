"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Mic, Volume2, Users, FileAudio, BarChart3, Settings, Zap } from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Text to Speech",
    href: "/dashboard/text-to-speech",
    icon: Volume2,
  },
  {
    title: "Speech to Text",
    href: "/dashboard/speech-to-text",
    icon: Mic,
  },
  {
    title: "Voice Cloning",
    href: "/dashboard/voice-cloning",
    icon: Users,
  },
  {
    title: "Audio Files",
    href: "/dashboard/files",
    icon: FileAudio,
  },
  {
    title: "Usage & Analytics",
    href: "/dashboard/usage",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-sidebar-foreground">CTRL</span>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Button
                key={item.href}
                asChild
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Link href={item.href}>
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.title}
                </Link>
              </Button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
