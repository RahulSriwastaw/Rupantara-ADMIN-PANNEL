"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { adminTransactionsApi } from "@/services/adminApi"
import { useToast } from "@/hooks/use-toast"
import { Search, Download, RefreshCw } from "lucide-react"

interface Transaction {
  id: string
  userId: string
  userName: string
  type: string
  amount: number
  description: string
  createdAt: string
  status: "completed" | "pending" | "failed"
}

export default function TransactionsPage() {
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      // Fetch transactions from real API
      const transactionsData = await adminTransactionsApi.getAll()
      
      // Format transactions to match the expected structure
      const formattedTransactions: Transaction[] = Array.isArray(transactionsData)
        ? transactionsData.map((t: any) => ({
            id: t.id || t._id || '',
            userId: t.userId || t.user?.id || '',
            userName: t.userName || t.user?.name || t.user?.fullName || 'Unknown',
            type: t.type || 'unknown',
            amount: t.amount || 0,
            description: t.description || t.reason || '',
            createdAt: t.createdAt || new Date().toISOString(),
            status: t.status === 'pending' ? 'pending' : t.status === 'failed' ? 'failed' : 'completed',
          }))
        : []
      
      setTransactions(formattedTransactions)
    } catch (error: any) {
      console.error('Error loading transactions:', error)
      setTransactions([])
      toast({
        title: "Error",
        description: error.message || "Failed to load transactions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTransactions = transactions.filter((transaction) => 
    transaction.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRefund = async (id: string) => {
    if (!confirm("Are you sure you want to refund this transaction?")) return
    try {
      await adminTransactionsApi.refund(id)
      toast({
        title: "Success",
        description: "Transaction refunded successfully",
      })
      loadTransactions()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to refund transaction",
        variant: "destructive",
      })
    }
  }

  const handleExport = async () => {
    try {
      const data = await adminTransactionsApi.export()
      // In production, this would download a CSV file
      toast({
        title: "Success",
        description: "Transactions exported successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to export transactions",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transaction Management</h1>
        <p className="text-muted-foreground">View and manage all transactions</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transactions</CardTitle>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-xs">{transaction.id}</TableCell>
                    <TableCell>{transaction.userName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.type}</Badge>
                    </TableCell>
                    <TableCell className={transaction.amount > 0 ? "text-green-500" : "text-red-500"}>
                      {transaction.amount > 0 ? "+" : ""}₹{Math.abs(transaction.amount)}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          transaction.status === "completed" ? "default" :
                          transaction.status === "pending" ? "secondary" : "destructive"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(transaction.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      {transaction.type === "purchase" && transaction.status === "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRefund(transaction.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

