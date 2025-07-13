"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  Wallet, 
  Brain, 
  FileText, 
  TrendingUp,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
    description: "Multi-chain portfolio overview"
  },
  {
    name: "ML Insights",
    href: "/ml-insights",
    icon: Brain,
    description: "AI-powered analytics"
  },
  {
    name: "Tax Reports",
    href: "/tax-report",
    icon: FileText,
    description: "Generate tax reports"
  }
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Crypto Analytics
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "flex items-center gap-2",
                      isActive ? "bg-blue-600 text-white" : "text-slate-600 dark:text-slate-400"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
} 