"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ShieldAlert, EyeOff, Ban, Flag } from "lucide-react"

interface FlaggedItem {
  id: string
  type: string
  user: string
  reason: string
  score: number
  status: string
  date: string
}

export default function ModerationPage() {
  const [items, setItems] = useState<FlaggedItem[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    setItems([
      { id: "F-1024", type: "Image", user: "user123", reason: "NSFW content detected", score: 0.82, status: "Pending", date: new Date().toLocaleString() },
      { id: "F-1025", type: "Prompt", user: "jane_smith", reason: "Hate speech", score: 0.67, status: "Pending", date: new Date().toLocaleString() },
      { id: "F-1030", type: "Template", user: "creator_alpha", reason: "Suspicious activity", score: 0.44, status: "Reviewed", date: new Date().toLocaleString() },
    ])
  }, [])

  const overviewCards = [
    { title: "Pending Reviews", value: 32, icon: ShieldAlert, color: "text-orange-500" },
    { title: "Auto-Blocked Today", value: 12, icon: EyeOff, color: "text-red-500" },
    { title: "User Reports", value: 18, icon: Flag, color: "text-yellow-500" },
    { title: "Total Bans This Month", value: 4, icon: Ban, color: "text-red-600" },
  ]

  const filtered = items.filter(i => 
    i.user.toLowerCase().includes(search.toLowerCase()) ||
    i.id.toLowerCase().includes(search.toLowerCase()) ||
    i.reason.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Moderation</h1>
        <p className="text-muted-foreground">Flagged content and review queue</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((c) => {
          const Icon = c.icon
          return (
            <Card key={c.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
                <Icon className={`h-4 w-4 ${c.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{c.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Flagged Content</CardTitle>
              <CardDescription>Auto-flagged and reported items</CardDescription>
            </div>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search flagged..." className="w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.user}</TableCell>
                  <TableCell>{item.reason}</TableCell>
                  <TableCell>{Math.round(item.score * 100)}%</TableCell>
                  <TableCell>
                    <Badge variant={item.status === "Pending" ? "destructive" : "default"}>{item.status}</Badge>
                  </TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Approve</Button>
                      <Button size="sm" variant="outline">Block</Button>
                      <Button size="sm" variant="outline">Ban User</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

