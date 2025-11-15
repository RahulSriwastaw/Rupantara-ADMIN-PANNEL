"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReportsPage() {
  const [period, setPeriod] = useState("last_30")

  const kpis = [
    { title: "Total Users", value: 1250 },
    { title: "Generations in Period", value: 4800 },
    { title: "Revenue", value: "₹45,000" },
    { title: "Active Creators", value: 45 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">Key metrics and exports</p>
      </div>

      <div className="flex gap-4 items-center">
        <span className="text-sm">Time Period</span>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="last_7">Last 7 days</SelectItem>
            <SelectItem value="last_30">Last 30 days</SelectItem>
            <SelectItem value="this_month">This month</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map(k => (
          <Card key={k.title}>
            <CardHeader>
              <CardTitle className="text-sm">{k.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

