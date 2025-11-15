"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

const data = [
  { month: "Jan", income: 10000, payouts: 3000, ads: 800 },
  { month: "Feb", income: 15000, payouts: 4500, ads: 1000 },
  { month: "Mar", income: 20000, payouts: 7000, ads: 1200 },
  { month: "Apr", income: 25000, payouts: 9000, ads: 1500 },
]

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Revenue & Finance</h1>
        <p className="text-muted-foreground">Income vs Expense overview and reports</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹45,000</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Creator Payouts</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹15,000</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net Profit</CardTitle>
            <CardDescription>Income - Payouts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹36,000</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
          <CardDescription>Income vs Creator Payments vs Ads</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" name="Income" />
              <Bar dataKey="payouts" fill="#ef4444" name="Creator Payments" />
              <Bar dataKey="ads" fill="#eab308" name="Ads Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Finance Reports</CardTitle>
          <CardDescription>CSV / Excel / PDF</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded bg-secondary">CSV</button>
            <button className="px-3 py-2 rounded bg-secondary">Excel</button>
            <button className="px-3 py-2 rounded bg-secondary">PDF</button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

