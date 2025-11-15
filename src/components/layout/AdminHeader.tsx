"use client"

import Image from "next/image"
import Link from "next/link"
import { Bell, Search, AlertTriangle, Flag, LifeBuoy, TriangleAlert, CreditCard, UserCog, LogOut, User, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAdminAuthStore } from "@/store/adminAuthStore"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function AdminHeader() {
  const { admin, logout } = useAdminAuthStore()
  const router = useRouter()
  const [badgeCount, setBadgeCount] = useState(0)
  const [notifications, setNotifications] = useState({
    pendingCreatorApplications: 0,
    flaggedContent: 0,
    highPriorityTickets: 0,
    systemWarnings: 0,
    paymentFailures: 0,
  })

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  useEffect(() => {
    setNotifications({
      pendingCreatorApplications: 3,
      flaggedContent: 5,
      highPriorityTickets: 2,
      systemWarnings: 1,
      paymentFailures: 1,
    })
  }, [])

  useEffect(() => {
    const total = Object.values(notifications).reduce((sum, v) => sum + v, 0)
    setBadgeCount(total)
  }, [notifications])

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between h-full px-6">
        <Link href="/" className="flex items-center space-x-3 min-w-0 flex-shrink-0 group hover:opacity-90 transition-opacity">
          <div className="relative h-10 w-10 rounded-lg flex-shrink-0 flex items-center justify-center bg-transparent">
            <Image
              src="/logo.png"
              alt="Rupantar AI"
              width={40}
              height={40}
              className="object-contain w-full h-full"
              priority
              unoptimized
            />
          </div>
          <span className="font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent text-lg whitespace-nowrap">
            Rupantar AI
          </span>
        </Link>
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="relative hidden md:block max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-10 w-64"
            />
          </div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {badgeCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center">
                    {badgeCount}
                  </span>
                )}
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="min-w-[280px] bg-card border border-border rounded-md shadow-md p-2" side="bottom" align="end">
              <div className="px-2 py-1 text-sm font-semibold">Alerts</div>
              <div className="divide-y divide-border">
                <div className="py-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <UserCog className="h-4 w-4 text-foreground" />
                      <span>Pending creator applications</span>
                    </div>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded">{notifications.pendingCreatorApplications}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Flag className="h-4 w-4 text-foreground" />
                      <span>Flagged content awaiting review</span>
                    </div>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded">{notifications.flaggedContent}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <LifeBuoy className="h-4 w-4 text-foreground" />
                      <span>High-priority support tickets</span>
                    </div>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded">{notifications.highPriorityTickets}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-foreground" />
                      <span>System warnings</span>
                    </div>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded">{notifications.systemWarnings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-4 w-4 text-foreground" />
                      <span>Payment failures</span>
                    </div>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded">{notifications.paymentFailures}</span>
                  </div>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNotifications({
                      pendingCreatorApplications: 0,
                      flaggedContent: 0,
                      highPriorityTickets: 0,
                      systemWarnings: 0,
                      paymentFailures: 0,
                    })}
                  >
                    Mark all as read
                  </Button>
                  <Link href="/support" className="text-xs text-primary hover:underline">
                    View all
                  </Link>
                </div>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          {admin && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{admin.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{admin.role.replace('_', ' ')}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {admin.name.charAt(0).toUpperCase()}
                  </div>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="min-w-[200px] bg-card border border-border rounded-md shadow-md p-1" side="bottom" align="end">
                <DropdownMenu.Item className="px-3 py-2 rounded-sm hover:bg-secondary cursor-pointer outline-none">
                  <Link href="/profile" className="flex items-center gap-2 w-full">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Profile</span>
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="px-3 py-2 rounded-sm hover:bg-secondary cursor-pointer outline-none">
                  <Link href="/settings" className="flex items-center gap-2 w-full">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Settings</span>
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-border my-1" />
                <DropdownMenu.Item 
                  className="px-3 py-2 rounded-sm hover:bg-destructive/10 hover:text-destructive cursor-pointer outline-none"
                  onClick={handleLogout}
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Logout</span>
                  </div>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          )}
        </div>
      </div>
    </header>
  )
}

