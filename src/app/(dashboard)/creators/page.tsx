"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { adminCreatorsApi } from "@/services/adminApi"
import * as Tabs from "@radix-ui/react-tabs"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Search, CheckCircle, XCircle, Ban, CheckCheck } from "lucide-react"

interface Creator {
  id: string
  name: string
  email: string
  username: string
  status: "active" | "pending" | "banned"
  isVerified: boolean
  totalEarnings: number
  templatesCount: number
  createdAt: string
}

export default function CreatorsPage() {
  const { toast } = useToast()
  const [creators, setCreators] = useState<Creator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<string>("list")
  const [withdrawals, setWithdrawals] = useState<Array<{ id: string; creatorId: string; creatorName: string; amount: number; method: string; account: string; status: "pending" | "processed"; requestedAt: string }>>([])
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<string | null>(null)

  useEffect(() => {
    loadCreators()
    loadWithdrawals()
  }, [])

  const loadCreators = async () => {
    setIsLoading(true)
    try {
      // Fetch creators from real API
      const creatorsData = await adminCreatorsApi.getAll()
      
      // Format creators to match the expected structure
      const formattedCreators: Creator[] = Array.isArray(creatorsData)
        ? creatorsData.map((c: any) => ({
            id: c.id || c._id || '',
            name: c.name || c.fullName || 'Unknown',
            email: c.email || '',
            username: c.username || c.email?.split('@')[0] || 'user',
            status: c.status === 'banned' ? 'banned' : c.status === 'pending' ? 'pending' : 'active',
            isVerified: c.isVerified || false,
            totalEarnings: c.totalEarnings || c.earnings || 0,
            templatesCount: c.templatesCount || c.templates?.length || 0,
            createdAt: c.createdAt || new Date().toISOString(),
          }))
        : []
      
      setCreators(formattedCreators)
    } catch (error: any) {
      console.error('Error loading creators:', error)
      setCreators([])
      toast({
        title: "Error",
        description: error.message || "Failed to load creators",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadWithdrawals = async () => {
    try {
      // Fetch withdrawals from creators API
      // Note: This might need to be implemented in the backend
      // For now, return empty array if API doesn't support it
      setWithdrawals([])
    } catch (error: any) {
      console.error('Error loading withdrawals:', error)
      setWithdrawals([])
      toast({ title: "Error", description: "Failed to load withdrawals", variant: "destructive" })
    }
  }

  const filteredCreators = creators.filter((creator) => 
    creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    creator.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    creator.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleApprove = async (id: string) => {
    try {
      await adminCreatorsApi.approve(id)
      setCreators(creators.map(c => c.id === id ? { ...c, status: "active" as const } : c))
      toast({
        title: "Success",
        description: "Creator approved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to approve creator",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (id: string) => {
    try {
      await adminCreatorsApi.reject(id)
      setCreators(creators.filter(c => c.id !== id))
      toast({
        title: "Success",
        description: "Creator application rejected",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to reject creator",
        variant: "destructive",
      })
    }
  }

  const handleBan = async (id: string) => {
    try {
      await adminCreatorsApi.ban(id)
      setCreators(creators.map(c => c.id === id ? { ...c, status: "banned" as const } : c))
      toast({
        title: "Success",
        description: "Creator banned successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to ban creator",
        variant: "destructive",
      })
    }
  }

  const handleUnban = async (id: string) => {
    try {
      await adminCreatorsApi.unban(id)
      setCreators(creators.map(c => c.id === id ? { ...c, status: "active" as const } : c))
      toast({
        title: "Success",
        description: "Creator unbanned successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to unban creator",
        variant: "destructive",
      })
    }
  }

  const handleVerify = async (id: string) => {
    try {
      await adminCreatorsApi.verify(id)
      setCreators(creators.map(c => c.id === id ? { ...c, isVerified: true } : c))
      toast({
        title: "Success",
        description: "Creator verified successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to verify creator",
        variant: "destructive",
      })
    }
  }

  const processWithdrawal = async (creatorId: string, withdrawalId: string) => {
    try {
      await adminCreatorsApi.processWithdrawal(creatorId, withdrawalId)
      setWithdrawals(ws => ws.map(w => w.id === withdrawalId ? { ...w, status: "processed" } : w))
      toast({ title: "Success", description: "Withdrawal processed" })
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to process withdrawal", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Creator Management</h1>
        <p className="text-muted-foreground">Applications, earnings, withdrawals</p>
      </div>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex gap-2 mb-4">
          <Tabs.Trigger value="list" className="px-3 py-2 rounded bg-secondary">Creators</Tabs.Trigger>
          <Tabs.Trigger value="applications" className="px-3 py-2 rounded bg-secondary">Applications Queue</Tabs.Trigger>
          <Tabs.Trigger value="withdrawals" className="px-3 py-2 rounded bg-secondary">Withdrawals</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="list">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Creators</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search creators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading creators...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead>Templates</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCreators.map((creator) => (
                      <TableRow key={creator.id}>
                        <TableCell className="font-medium">{creator.name}</TableCell>
                        <TableCell>{creator.email}</TableCell>
                        <TableCell>{creator.username}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              creator.status === "active" ? "default" :
                              creator.status === "pending" ? "secondary" : "destructive"
                            }
                          >
                            {creator.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {creator.isVerified ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <span className="text-muted-foreground">Not verified</span>
                          )}
                        </TableCell>
                        <TableCell>₹{creator.totalEarnings.toLocaleString()}</TableCell>
                        <TableCell>{creator.templatesCount}</TableCell>
                        <TableCell>{new Date(creator.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {creator.status === "pending" && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => handleApprove(creator.id)}>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleReject(creator.id)}>
                                  <XCircle className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            )}
                            {creator.status === "active" && !creator.isVerified && (
                              <Button variant="ghost" size="sm" onClick={() => handleVerify(creator.id)}>
                                <CheckCheck className="h-4 w-4" />
                              </Button>
                            )}
                            {creator.status === "active" ? (
                              <Button variant="ghost" size="sm" onClick={() => handleBan(creator.id)}>
                                <Ban className="h-4 w-4" />
                              </Button>
                            ) : creator.status === "banned" && (
                              <Button variant="ghost" size="sm" onClick={() => handleUnban(creator.id)}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Applications Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Approve or reject pending creator applications</div>
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creators.filter(c => c.status === "pending").map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.username}</TableCell>
                      <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleApprove(c.id)}>Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(c.id)}>Reject</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawals Processing</CardTitle>
              <CardDescription>Review and process pending withdrawals</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="font-mono text-xs">{w.id}</TableCell>
                      <TableCell>{w.creatorName}</TableCell>
                      <TableCell>₹{w.amount.toLocaleString()}</TableCell>
                      <TableCell>{w.method}</TableCell>
                      <TableCell>{w.account}</TableCell>
                      <TableCell>{new Date(w.requestedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={w.status === "pending" ? "secondary" : "default"}>{w.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedWithdrawal(w.id)}>Detail</Button>
                          <Button size="sm" disabled={w.status !== "pending"} onClick={() => processWithdrawal(w.creatorId, w.id)}>Process</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {selectedWithdrawal && (
                <div className="mt-4 p-4 rounded border">
                  <Label>Notes</Label>
                  <div className="text-sm text-muted-foreground">Review KYC and settlement account before processing.</div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => setSelectedWithdrawal(null)}>Close</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}

