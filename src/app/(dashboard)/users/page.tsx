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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { adminUsersApi, adminAuthApi } from "@/services/adminApi"
import { useToast } from "@/hooks/use-toast"
import { Search, Ban, CheckCircle, Plus, Trash2, Eye, Download, RefreshCw, Cloud } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import * as Tabs from "@radix-ui/react-tabs"

interface User {
  id: string
  userId: string
  username: string
  email: string
  phone?: string
  fullName: string
  role: "user" | "creator" | "admin"
  isVerified: boolean
  pointsBalance: number
  memberSince: string
  lastActive: string
  totalGenerations: number
  status: "active" | "inactive" | "banned"
}

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("recent")
  const [regStart, setRegStart] = useState<string>("")
  const [regEnd, setRegEnd] = useState<string>("")
  const [pointsMin, setPointsMin] = useState<string>("")
  const [pointsMax, setPointsMax] = useState<string>("")
  const [activityFilter, setActivityFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showAddPointsDialog, setShowAddPointsDialog] = useState(false)
  const [pointsToAdd, setPointsToAdd] = useState("")
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createForm, setCreateForm] = useState<{fullName:string;email:string;phone?:string;username?:string;pointsBalance?:number;isCreator?:boolean;isVerified?:boolean}>({fullName:'',email:''})
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editForm, setEditForm] = useState<any>({})

  useEffect(() => {
    loadUsers()
  }, [statusFilter, roleFilter])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      // Fetch users from real API
      const filters: any = {}
      if (statusFilter !== 'all') filters.status = statusFilter
      if (roleFilter !== 'all') filters.role = roleFilter
      
      console.log('Loading users with filters:', filters)
      const usersData = await adminUsersApi.getAll(filters)
      console.log('Users loaded from API:', usersData?.length || 0, 'users')
      
      if (Array.isArray(usersData)) {
        setUsers(usersData)
        console.log('Sample users:', usersData.slice(0, 3).map(u => ({ email: u.email, fullName: u.fullName })))
      } else {
        console.warn('Users data is not an array:', usersData)
        setUsers([])
      }
    } catch (error: any) {
      console.error('Error loading users:', error)
      setUsers([])
      // Don't show toast for timeout errors, just log
      if (!error.message?.includes('timeout') && !error.message?.includes('Request timeout')) {
        toast({
          title: "Error",
          description: error.message || "Failed to load users",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users
    .filter((user) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        user.fullName.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.username.toLowerCase().includes(q) ||
        user.userId.toLowerCase().includes(q)
      const matchesStatus = statusFilter === "all" || user.status === statusFilter
      const matchesRole = roleFilter === "all" || user.role === roleFilter
      const regOk = (!regStart || new Date(user.memberSince) >= new Date(regStart)) && (!regEnd || new Date(user.memberSince) <= new Date(regEnd))
      const pointsOk = (!pointsMin || user.pointsBalance >= parseInt(pointsMin)) && (!pointsMax || user.pointsBalance <= parseInt(pointsMax))
      const lastActiveDays = (Date.now() - new Date(user.lastActive).getTime()) / (24 * 3600 * 1000)
      const activityOk = activityFilter === "all" || (activityFilter === "active7" && lastActiveDays <= 7) || (activityFilter === "inactive30" && lastActiveDays > 30)
      return matchesSearch && matchesStatus && matchesRole && regOk && pointsOk && activityOk
    })
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.memberSince).getTime() - new Date(a.memberSince).getTime()
      if (sortBy === "points_desc") return b.pointsBalance - a.pointsBalance
      if (sortBy === "points_asc") return a.pointsBalance - b.pointsBalance
      if (sortBy === "gens_desc") return b.totalGenerations - a.totalGenerations
      if (sortBy === "gens_asc") return a.totalGenerations - b.totalGenerations
      if (sortBy === "last_active") return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
      return 0
    })

  const handleBan = async (userId: string) => {
    try {
      await adminUsersApi.ban(userId)
      setUsers(users.map(u => u.id === userId ? { ...u, status: "banned" as const } : u))
      toast({
        title: "Success",
        description: "User banned successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive",
      })
    }
  }

  const handleUnban = async (userId: string) => {
    try {
      await adminUsersApi.unban(userId)
      setUsers(users.map(u => u.id === userId ? { ...u, status: "active" as const } : u))
      toast({
        title: "Success",
        description: "User unbanned successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to unban user",
        variant: "destructive",
      })
    }
  }

  const handleVerify = async (userId: string) => {
    try {
      await adminUsersApi.verify(userId)
      setUsers(users.map(u => u.id === userId ? { ...u, isVerified: true } : u))
      toast({
        title: "Success",
        description: "User verified successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to verify user",
        variant: "destructive",
      })
    }
  }

  const handleAddPoints = async () => {
    if (!selectedUser || !pointsToAdd) return
    try {
      await adminUsersApi.addPoints(selectedUser.id, parseInt(pointsToAdd))
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, pointsBalance: u.pointsBalance + parseInt(pointsToAdd) }
          : u
      ))
      toast({
        title: "Success",
        description: `Added ${pointsToAdd} points to user`,
      })
      setShowAddPointsDialog(false)
      setPointsToAdd("")
      setSelectedUser(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add points",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    try {
      await adminUsersApi.delete(userId)
      setUsers(users.filter(u => u.id !== userId))
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const selectAll = () => {
    setSelectedIds(filteredUsers.map((u) => u.id))
  }

  const clearSelection = () => setSelectedIds([])

  const bulkBan = async () => {
    for (const id of selectedIds) await handleBan(id)
    clearSelection()
  }

  const bulkDelete = async () => {
    for (const id of selectedIds) await handleDelete(id)
    clearSelection()
  }

  const bulkAddPoints = async () => {
    if (!pointsToAdd) return
    for (const id of selectedIds) await adminUsersApi.addPoints(id, parseInt(pointsToAdd))
    setUsers(users.map(u => selectedIds.includes(u.id) ? { ...u, pointsBalance: u.pointsBalance + parseInt(pointsToAdd) } : u))
    clearSelection()
    toast({ title: "Success", description: `Added ${pointsToAdd} points to selected users` })
  }

  const exportSelectedCsv = () => {
    const rows = users.filter(u => selectedIds.includes(u.id))
    const headers = ["User ID","Username","Name","Email","Phone","Role","Status","Points","Member Since","Last Active","Total Generations"]
    const csv = [headers.join(","), ...rows.map(u => [u.userId,u.username,u.fullName,u.email,u.phone||"",u.role,u.status,u.pointsBalance,u.memberSince,u.lastActive,u.totalGenerations].join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "users_export.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage all platform users</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users</CardTitle>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={loadUsers}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async ()=>{ try { await adminAuthApi.syncFirebaseUsers(); await loadUsers(); toast({ title: "Synced", description: "Firebase users synced to MongoDB" }) } catch (e:any){ toast({ title: "Sync failed", description: e.message || "Unable to sync", variant: "destructive" }) } }}
                disabled={isLoading}
                title="Sync Firebase users to MongoDB"
              >
                <Cloud className="h-4 w-4 mr-2" />
                Sync Firebase Users
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="default" onClick={()=>{ setCreateForm({fullName:'',email:'',phone:'',username:'',pointsBalance:100,isCreator:false,isVerified:false}); setShowCreateDialog(true) }}>Create User</Button>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="creator">Creators</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Registration date (newest)</SelectItem>
                  <SelectItem value="points_desc">Points (high → low)</SelectItem>
                  <SelectItem value="points_asc">Points (low → high)</SelectItem>
                  <SelectItem value="gens_desc">Generations (high → low)</SelectItem>
                  <SelectItem value="gens_asc">Generations (low → high)</SelectItem>
                  <SelectItem value="last_active">Last activity (recent)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Registration start</Label>
              <Input type="date" value={regStart} onChange={(e)=>setRegStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Registration end</Label>
              <Input type="date" value={regEnd} onChange={(e)=>setRegEnd(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Points min</Label>
              <Input type="number" value={pointsMin} onChange={(e)=>setPointsMin(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Points max</Label>
              <Input type="number" value={pointsMax} onChange={(e)=>setPointsMax(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Activity status</Label>
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Activity status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active7">Active last 7 days</SelectItem>
                  <SelectItem value="inactive30">Inactive > 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
              <Button variant="outline" onClick={selectAll}>Select All</Button>
              <Button variant="outline" onClick={clearSelection}>Clear</Button>
              <span className="text-sm text-muted-foreground">Selected: {selectedIds.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Input type="number" placeholder="Points" value={pointsToAdd} onChange={(e)=>setPointsToAdd(e.target.value)} className="w-28" />
              <Button variant="outline" onClick={bulkAddPoints}>Add Points</Button>
              <Button variant="outline" onClick={bulkBan}>Ban Selected</Button>
              <Button variant="outline" onClick={bulkDelete}>Delete Selected</Button>
              <Button variant="outline" onClick={exportSelectedCsv}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Member Since</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Generations</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <input type="checkbox" checked={selectedIds.includes(user.id)} onChange={()=>toggleSelect(user.id)} />
                    </TableCell>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.userId}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "creator" ? "default" : user.role === "admin" ? "secondary" : "secondary"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : user.status === "inactive" ? "secondary" : "destructive"}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isVerified ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <span className="text-muted-foreground">Not verified</span>
                      )}
                    </TableCell>
                    <TableCell>{user.pointsBalance}</TableCell>
                    <TableCell>{new Date(user.memberSince).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(user.lastActive).toLocaleDateString()}</TableCell>
                    <TableCell>{user.totalGenerations}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setDetailOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setShowAddPointsDialog(true)
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        {user.status === "active" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBan(user.id)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnban(user.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {!user.isVerified && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerify(user.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedUser(user); setEditForm({fullName:user.fullName,email:user.email,phone:user.phone,username:user.username,role:user.role,status:user.status,pointsBalance:user.pointsBalance,isCreator:user.role==='creator',isVerified:user.isVerified}); setShowEditDialog(true) }}
                        >
                          Edit
                        </Button>
                        {user.role !== 'creator' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async()=>{ try { await adminUsersApi.promote(user.id); toast({ title:'Promoted', description:'User is now a creator' }); await loadUsers() } catch(e:any){ toast({ title:'Failed', description:e.message, variant:'destructive' }) } }}
                          >
                            Promote
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

      <Dialog open={showAddPointsDialog} onOpenChange={setShowAddPointsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Points</DialogTitle>
            <DialogDescription>
              Add points to {selectedUser?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Points to Add</Label>
              <Input
                type="number"
                value={pointsToAdd}
                onChange={(e) => setPointsToAdd(e.target.value)}
                placeholder="Enter points"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPointsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPoints}>Add Points</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>{selectedUser?.fullName} ({selectedUser?.userId})</DialogDescription>
          </DialogHeader>
          <Tabs.Root defaultValue="profile">
            <Tabs.List className="flex gap-2 mb-4">
              <Tabs.Trigger value="profile" className="px-3 py-2 rounded bg-secondary">Profile</Tabs.Trigger>
              <Tabs.Trigger value="activity" className="px-3 py-2 rounded bg-secondary">Activity</Tabs.Trigger>
              <Tabs.Trigger value="transactions" className="px-3 py-2 rounded bg-secondary">Transactions</Tabs.Trigger>
              <Tabs.Trigger value="content" className="px-3 py-2 rounded bg-secondary">Content</Tabs.Trigger>
              <Tabs.Trigger value="actions" className="px-3 py-2 rounded bg-secondary">Actions</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="profile">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p>Name: {selectedUser?.fullName}</p>
                  <p>Email: {selectedUser?.email}</p>
                  <p>Phone: {selectedUser?.phone || "-"}</p>
                  <p>Username: {selectedUser?.username}</p>
                  <p>Role: {selectedUser?.role}</p>
                </div>
                <div>
                  <p>Member since: {selectedUser ? new Date(selectedUser.memberSince).toLocaleDateString() : ""}</p>
                  <p>Last login: {selectedUser ? new Date(selectedUser.lastActive).toLocaleString() : ""}</p>
                  <p>Status: {selectedUser?.status}</p>
                  <p>Points: {selectedUser?.pointsBalance}</p>
                </div>
              </div>
            </Tabs.Content>
            <Tabs.Content value="activity">
              <p className="text-sm text-muted-foreground">Recent generations, templates used, login history</p>
            </Tabs.Content>
            <Tabs.Content value="transactions">
              <p className="text-sm text-muted-foreground">Points transactions and payments history</p>
            </Tabs.Content>
            <Tabs.Content value="content">
              <p className="text-sm text-muted-foreground">Generated images and flagged content</p>
            </Tabs.Content>
            <Tabs.Content value="actions">
              <div className="flex gap-2">
                <Button onClick={() => setShowAddPointsDialog(true)}>Add Points</Button>
                <Button variant="outline" onClick={() => selectedUser && handleVerify(selectedUser.id)}>Verify Email</Button>
                <Button variant="outline" onClick={() => selectedUser && handleBan(selectedUser.id)}>Suspend</Button>
              </div>
            </Tabs.Content>
          </Tabs.Root>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={createForm.fullName} onChange={(e)=>setCreateForm({...createForm,fullName:e.target.value})} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={createForm.email} onChange={(e)=>setCreateForm({...createForm,email:e.target.value})} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={createForm.phone||''} onChange={(e)=>setCreateForm({...createForm,phone:e.target.value})} />
            </div>
            <div>
              <Label>Username</Label>
              <Input value={createForm.username||''} onChange={(e)=>setCreateForm({...createForm,username:e.target.value})} />
            </div>
            <div>
              <Label>Points</Label>
              <Input type="number" value={createForm.pointsBalance||0} onChange={(e)=>setCreateForm({...createForm,pointsBalance:parseInt(e.target.value||'0')})} />
            </div>
            <div className="flex items-center gap-2">
              <Label>Creator</Label>
              <input type="checkbox" checked={!!createForm.isCreator} onChange={(e)=>setCreateForm({...createForm,isCreator:e.target.checked})} />
            </div>
            <div className="flex items-center gap-2">
              <Label>Verified</Label>
              <input type="checkbox" checked={!!createForm.isVerified} onChange={(e)=>setCreateForm({...createForm,isVerified:e.target.checked})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={async()=>{ try { await adminUsersApi.create(createForm); setShowCreateDialog(false); toast({ title:'Created', description:'User created' }); await loadUsers() } catch(e:any){ toast({ title:'Failed', description:e.message, variant:'destructive' }) } }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={editForm.fullName||''} onChange={(e)=>setEditForm({...editForm,fullName:e.target.value})} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={editForm.email||''} onChange={(e)=>setEditForm({...editForm,email:e.target.value})} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={editForm.phone||''} onChange={(e)=>setEditForm({...editForm,phone:e.target.value})} />
            </div>
            <div>
              <Label>Username</Label>
              <Input value={editForm.username||''} onChange={(e)=>setEditForm({...editForm,username:e.target.value})} />
            </div>
            <div>
              <Label>Role</Label>
              <Input value={editForm.role||'user'} onChange={(e)=>setEditForm({...editForm,role:e.target.value})} />
            </div>
            <div>
              <Label>Status</Label>
              <Input value={editForm.status||'active'} onChange={(e)=>setEditForm({...editForm,status:e.target.value})} />
            </div>
            <div>
              <Label>Points</Label>
              <Input type="number" value={editForm.pointsBalance||0} onChange={(e)=>setEditForm({...editForm,pointsBalance:parseInt(e.target.value||'0')})} />
            </div>
            <div className="flex items-center gap-2">
              <Label>Creator</Label>
              <input type="checkbox" checked={!!editForm.isCreator} onChange={(e)=>setEditForm({...editForm,isCreator:e.target.checked, role:e.target.checked?'creator':editForm.role})} />
            </div>
            <div className="flex items-center gap-2">
              <Label>Verified</Label>
              <input type="checkbox" checked={!!editForm.isVerified} onChange={(e)=>setEditForm({...editForm,isVerified:e.target.checked})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={async()=>{ try { if (!selectedUser) return; await adminUsersApi.update(selectedUser.id, editForm); setShowEditDialog(false); toast({ title:'Updated', description:'User updated' }); await loadUsers() } catch(e:any){ toast({ title:'Failed', description:e.message, variant:'destructive' }) } }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

