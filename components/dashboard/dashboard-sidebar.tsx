"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { LayoutDashboard, Mic, Volume2, Users, FileAudio, BarChart3, Settings, Zap, Menu } from "lucide-react"
import { useState } from "react"

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

const NavContent = ({ pathname, onLinkClick }: { pathname: string; onLinkClick?: () => void }) => (
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
          onClick={onLinkClick}
        >
          <Link href={item.href}>
            <item.icon className="w-4 h-4 mr-3" />
            {item.title}
          </Link>
        </Button>
      )
    })}
  </nav>
)

export function DashboardSidebar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-sidebar border-r border-sidebar-border">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground">CTRL8</span>
          </div>
          <NavContent pathname={pathname} />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden mr-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="p-6 border-b">
            <SheetTitle>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg text-sidebar-foreground">CTRL8</span>
              </div>
            </SheetTitle>
          </SheetHeader>
          <div className="p-6">
            <NavContent pathname={pathname} onLinkClick={() => setMobileMenuOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
