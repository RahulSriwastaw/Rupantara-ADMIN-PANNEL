"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FileImage,
  UserCog,
  CreditCard,
  BarChart3,
  Settings,
  Plug,
  HelpCircle,
  LogOut,
  Shield,
  Wallet,
  Cpu,
  PiggyBank,
  FileText
} from "lucide-react"
import { useAdminAuthStore } from "@/store/adminAuthStore"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/templates", label: "Templates", icon: FileImage },
  { href: "/creators", label: "Creators", icon: UserCog },
  { href: "/transactions", label: "Transactions", icon: CreditCard },
  { href: "/moderation", label: "Moderation", icon: Shield },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/ai", label: "AI Config", icon: Cpu },
  { href: "/finance", label: "Finance", icon: PiggyBank },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/admins", label: "Admins", icon: UserCog },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/support", label: "Support", icon: HelpCircle },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout, admin } = useAdminAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="flex flex-col h-screen w-64 bg-card border-r border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Admin Panel</h2>
        {admin && (
          <p className="text-sm text-muted-foreground mt-1">{admin.name}</p>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}

