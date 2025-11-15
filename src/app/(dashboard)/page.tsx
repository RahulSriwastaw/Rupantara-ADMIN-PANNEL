"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuthStore } from "@/store/adminAuthStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { adminAnalyticsApi } from "@/services/adminApi"
import { useToast } from "@/hooks/use-toast"
import { Users, FileImage, UserCog, DollarSign, Clock, HelpCircle, ActivitySquare, Server, Database, Cpu, HardDrive, CreditCard } from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface DashboardStats {
  totalUsers: number
  totalTemplates: number
  activeCreators: number
  totalRevenue: number
  pendingApprovals: number
  supportTickets: number
  userGrowth: { date: string; count: number }[]
  revenueTrends: { date: string; amount: number }[]
  templateUsage: { templateId: string; templateName: string; uses: number }[]
  topCreators: { creatorId: string; creatorName: string; earnings: number }[]
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, admin, token, hasHydrated } = useAdminAuthStore()
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activity, setActivity] = useState<{ time: string; type: string; detail: string }[]>([])
  const [health, setHealth] = useState({
    database: { status: "green", load: 35 },
    aiApi: { status: "green", responseTimeMs: 180 },
    paymentGateway: { status: "green" },
    storage: { status: "yellow", usagePercent: 72 },
    server: { status: "green", cpu: 42, memory: 58 },
    errorRate: { status: "green", percent: 0.6 },
  })
  
  console.log('Dashboard page rendered')

  // Authentication check - redirect if not authenticated
  useEffect(() => {
    if (!hasHydrated) return

    const hasValidAdmin = admin !== null && admin !== undefined && admin.id && admin.email;
    const hasValidToken = token !== null && token !== undefined && token.length > 0;
    const isReallyAuthenticated = isAuthenticated === true && hasValidAdmin && hasValidToken;

    if (!isReallyAuthenticated) {
      console.log('Dashboard page: Not authenticated, redirecting to login');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('rupantar-admin-auth');
        useAdminAuthStore.getState().logout();
      }
      router.replace("/login");
      return;
    }
  }, [hasHydrated, isAuthenticated, admin, token, router])

  useEffect(() => {
    // Only load dashboard if authenticated
    const hasValidAdmin = admin !== null && admin !== undefined && admin.id && admin.email;
    const hasValidToken = token !== null && token !== undefined && token.length > 0;
    const isReallyAuthenticated = isAuthenticated === true && hasValidAdmin && hasValidToken;

    if (isReallyAuthenticated) {
      loadDashboard()
      seedActivity()
      const interval = setInterval(() => {
        addActivityTick()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, admin, token])

  const loadDashboard = async () => {
    setIsLoading(true)
    try {
      // Call real API for dashboard stats
      const dashboardData = await adminAnalyticsApi.getDashboard()
      
      // Get additional analytics data
      const [revenueData, userGrowthData, templatePerformance, creatorPerformance] = await Promise.all([
        adminAnalyticsApi.getRevenue('monthly').catch(() => []),
        adminAnalyticsApi.getUserGrowth('monthly').catch(() => []),
        adminAnalyticsApi.getTemplatePerformance().catch(() => []),
        adminAnalyticsApi.getCreatorPerformance().catch(() => []),
      ])

      const stats: DashboardStats = {
        totalUsers: dashboardData.totalUsers || 0,
        totalTemplates: dashboardData.totalTemplates || 0,
        activeCreators: dashboardData.activeCreators || 0,
        totalRevenue: dashboardData.totalRevenue || 0,
        pendingApprovals: dashboardData.pendingApprovals || 0,
        supportTickets: dashboardData.supportTickets || 0,
        userGrowth: Array.isArray(userGrowthData) && userGrowthData.length > 0 
          ? userGrowthData 
          : [],
        revenueTrends: Array.isArray(revenueData) && revenueData.length > 0 
          ? revenueData 
          : [],
        templateUsage: Array.isArray(templatePerformance) && templatePerformance.length > 0
          ? templatePerformance.map((t: any) => ({
              templateId: t.templateId || t.id || '',
              templateName: t.templateName || t.title || 'Unknown',
              uses: t.uses || t.usageCount || 0,
            }))
          : [],
        topCreators: Array.isArray(creatorPerformance) && creatorPerformance.length > 0
          ? creatorPerformance.map((c: any) => ({
              creatorId: c.creatorId || c.id || '',
              creatorName: c.creatorName || c.name || 'Unknown',
              earnings: c.earnings || 0,
            }))
          : [],
      }
      setStats(stats)
    } catch (error: any) {
      console.error('Dashboard load error:', error)
      // Set default empty stats on error
      setStats({
        totalUsers: 0,
        totalTemplates: 0,
        activeCreators: 0,
        totalRevenue: 0,
        pendingApprovals: 0,
        supportTickets: 0,
        userGrowth: [],
        revenueTrends: [],
        templateUsage: [],
        topCreators: [],
      })
      toast({
        title: "Error",
        description: error.message || "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const seedActivity = () => {
    const now = new Date()
    setActivity([
      { time: new Date(now.getTime() - 5 * 60_000).toLocaleTimeString(), type: "User Registered", detail: "newuser123" },
      { time: new Date(now.getTime() - 4 * 60_000).toLocaleTimeString(), type: "Template Submitted", detail: "Wedding Portrait" },
      { time: new Date(now.getTime() - 3 * 60_000).toLocaleTimeString(), type: "Payment Received", detail: "₹999 - PRO PACK" },
      { time: new Date(now.getTime() - 2 * 60_000).toLocaleTimeString(), type: "Generation Completed", detail: "Image #48392" },
      { time: new Date(now.getTime() - 1 * 60_000).toLocaleTimeString(), type: "Support Ticket", detail: "Payment not reflected" },
    ])
  }

  const addActivityTick = () => {
    const types = [
      { type: "User Registered", detail: "user" + Math.floor(Math.random() * 10000) },
      { type: "Template Submitted", detail: ["Festival Poster", "Logo", "Portrait"][Math.floor(Math.random() * 3)] },
      { type: "Payment Received", detail: `₹${[199, 499, 999][Math.floor(Math.random() * 3)]}` },
      { type: "Generation Completed", detail: "Image #" + Math.floor(Math.random() * 50000) },
      { type: "Support Ticket", detail: ["Refund", "Login issue", "Slow generation"][Math.floor(Math.random() * 3)] },
    ]
    const entry = types[Math.floor(Math.random() * types.length)]
    setActivity((prev) => [{ time: new Date().toLocaleTimeString(), type: entry.type, detail: entry.detail }, ...prev].slice(0, 10))
  }

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      description: "Registered users",
      color: "text-blue-500",
    },
    {
      title: "Total Templates",
      value: stats.totalTemplates.toLocaleString(),
      icon: FileImage,
      description: "Available templates",
      color: "text-green-500",
    },
    {
      title: "Active Creators",
      value: stats.activeCreators.toLocaleString(),
      icon: UserCog,
      description: "Verified creators",
      color: "text-purple-500",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "All-time revenue",
      color: "text-yellow-500",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals.toString(),
      icon: Clock,
      description: "Awaiting review",
      color: "text-orange-500",
    },
    {
      title: "Support Tickets",
      value: stats.supportTickets.toString(),
      icon: HelpCircle,
      description: "Open tickets",
      color: "text-red-500",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Monthly user registration</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.revenueTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="amount" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity Stream</CardTitle>
            <CardDescription>Auto-refreshes every 30 seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activity.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                  <div className="flex items-center gap-3">
                    <ActivitySquare className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{item.type}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-right">
              <a href="#" className="text-sm text-primary hover:underline">View All Activity</a>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Template Usage</CardTitle>
            <CardDescription>Most used templates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.templateUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="templateName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="uses" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Live status indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span>Database</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${health.database.status === 'green' ? 'bg-green-600 text-white' : health.database.status === 'yellow' ? 'bg-yellow-500 text-black' : 'bg-red-600 text-white'}`}>{health.database.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  <span>AI API</span>
                </div>
                <span className="text-xs bg-secondary px-2 py-0.5 rounded">{health.aiApi.responseTimeMs}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Payment Gateway</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-green-600 text-white">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  <span>Storage</span>
                </div>
                <span className="text-xs bg-secondary px-2 py-0.5 rounded">{health.storage.usagePercent}% used</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  <span>Server</span>
                </div>
                <span className="text-xs bg-secondary px-2 py-0.5 rounded">CPU {health.server.cpu}% • Mem {health.server.memory}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Creators</CardTitle>
            <CardDescription>Highest earning creators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topCreators.map((creator, index) => (
                <div key={creator.creatorId} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{creator.creatorName}</p>
                      <p className="text-sm text-muted-foreground">Creator ID: {creator.creatorId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{creator.earnings.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total earnings</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

