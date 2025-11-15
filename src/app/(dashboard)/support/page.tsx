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
import { adminSupportApi } from "@/services/adminApi"
import { useToast } from "@/hooks/use-toast"
import { Search, MessageSquare, CheckCircle } from "lucide-react"

interface SupportTicket {
  id: string
  userId: string
  userName: string
  subject: string
  message: string
  status: "open" | "in-progress" | "resolved"
  priority: "low" | "medium" | "high"
  createdAt: string
}

export default function SupportPage() {
  const { toast } = useToast()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    setIsLoading(true)
    try {
      // Fetch support tickets from real API
      const ticketsData = await adminSupportApi.getAll()
      
      // Format tickets to match the expected structure
      const formattedTickets: SupportTicket[] = Array.isArray(ticketsData)
        ? ticketsData.map((t: any) => ({
            id: t.id || t._id || '',
            userId: t.userId || t.user?.id || '',
            userName: t.userName || t.user?.name || t.user?.fullName || 'Unknown',
            subject: t.subject || t.title || 'No subject',
            message: t.message || t.description || '',
            status: t.status === 'in-progress' ? 'in-progress' : t.status === 'resolved' ? 'resolved' : 'open',
            priority: t.priority || 'medium',
            createdAt: t.createdAt || new Date().toISOString(),
          }))
        : []
      
      setTickets(formattedTickets)
    } catch (error: any) {
      console.error('Error loading support tickets:', error)
      setTickets([])
      toast({
        title: "Error",
        description: error.message || "Failed to load support tickets",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTickets = tickets.filter((ticket) => 
    ticket.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminSupportApi.updateStatus(id, status)
      setTickets(tickets.map(t => t.id === id ? { ...t, status: status as any } : t))
      toast({
        title: "Success",
        description: "Ticket status updated",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      })
    }
  }

  const handleClose = async (id: string) => {
    try {
      await adminSupportApi.close(id)
      setTickets(tickets.map(t => t.id === id ? { ...t, status: "resolved" as const } : t))
      toast({
        title: "Success",
        description: "Ticket closed successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to close ticket",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Support Management</h1>
        <p className="text-muted-foreground">Manage support tickets</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Support Tickets</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading tickets...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-xs">{ticket.id}</TableCell>
                    <TableCell>{ticket.userName}</TableCell>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          ticket.status === "resolved" ? "default" :
                          ticket.status === "in-progress" ? "secondary" : "destructive"
                        }
                      >
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          ticket.priority === "high" ? "destructive" :
                          ticket.priority === "medium" ? "default" : "secondary"
                        }
                      >
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateStatus(ticket.id, "in-progress")}
                          disabled={ticket.status === "in-progress"}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        {ticket.status !== "resolved" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClose(ticket.id)}
                          >
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
    </div>
  )
}

