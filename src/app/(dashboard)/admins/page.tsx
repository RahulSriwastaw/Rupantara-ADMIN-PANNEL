"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAdminAuthStore } from "@/store/adminAuthStore"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, UserX, UserCheck } from "lucide-react"
import type { Admin, AdminPermissions } from "@/types/admin"
import { ADMIN_CONFIG } from "@/config/adminConfig"

export default function AdminsPage() {
  const { admin: currentAdmin } = useAdminAuthStore()
  const { toast } = useToast()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin" as Admin["role"],
    permissions: { ...ADMIN_CONFIG.DEFAULT_SUB_ADMIN_PERMISSIONS } as AdminPermissions,
  })

  // Check if current user is owner
  const isOwner = currentAdmin?.role === "owner"

  useEffect(() => {
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    try {
      // Fetch admins from API
      // Note: This endpoint might need to be implemented in the backend
      // For now, try to fetch from /api/admin/admins or return empty array
      const response = await fetch('/api/admin/admins', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const adminsData = await response.json()
        const formattedAdmins: Admin[] = Array.isArray(adminsData)
          ? adminsData.map((a: any) => ({
              id: a.id || a._id || '',
              email: a.email || '',
              name: a.name || 'Admin',
              role: a.role || 'admin',
              isActive: a.isActive !== undefined ? a.isActive : true,
              createdAt: a.createdAt || new Date().toISOString(),
              permissions: a.permissions || {},
            }))
          : []
        setAdmins(formattedAdmins)
      } else {
        // If endpoint doesn't exist, set empty array
        setAdmins([])
      }
    } catch (error: any) {
      console.error('Error loading admins:', error)
      // If API doesn't exist, set empty array
      setAdmins([])
    }
  }

  const handleCreateAdmin = async () => {
    if (!isOwner) {
      toast({
        title: "Access Denied",
        description: "Only owner can create sub-admins",
        variant: "destructive",
      })
      return
    }

    // Validate form
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    if (!formData.email.includes("@")) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    // Check if admin already exists
    if (admins.some(a => a.email === formData.email)) {
      toast({
        title: "Error",
        description: "An admin with this email already exists",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      // Create Firebase user if Firebase is configured
      let firebaseUserId: string | null = null
      const { auth } = await import("@/lib/firebaseClient")
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth")

      if (auth && auth.app) {
        try {
          // Create user in Firebase
          const userCred = await createUserWithEmailAndPassword(
            auth,
            formData.email,
            formData.password
          )
          firebaseUserId = userCred.user.uid

          // Update display name
          await updateProfile(userCred.user, {
            displayName: formData.name,
          })

          // Sign out the newly created user (they'll login themselves)
          await import("firebase/auth").then(m => m.signOut(auth))
        } catch (firebaseError: any) {
          console.error("Firebase user creation error:", firebaseError)
          // If Firebase fails but we still want to create admin, continue
          // In production, you might want to fail here
          if (firebaseError.code === "auth/email-already-in-use") {
            toast({
              title: "Error",
              description: "This email is already registered in Firebase",
              variant: "destructive",
            })
            return
          }
        }
      }

      // Create admin object
      const newAdmin: Admin = {
        id: firebaseUserId || `admin_${Date.now()}`,
        email: formData.email,
        name: formData.name,
        role: formData.role,
        permissions: formData.permissions,
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: currentAdmin?.id,
      }

      // In production, save to backend API here
      // await adminApi.post('/admins', newAdmin)

      setAdmins([...admins, newAdmin])
      toast({
        title: "Success",
        description: firebaseUserId 
          ? "Sub-admin created successfully with Firebase account"
          : "Sub-admin created successfully (Firebase not configured)",
      })
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "admin",
        permissions: { ...ADMIN_CONFIG.DEFAULT_SUB_ADMIN_PERMISSIONS } as AdminPermissions,
      })
      setIsCreateDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create sub-admin",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditAdmin = (admin: Admin) => {
    if (!isOwner && admin.id !== currentAdmin?.id) {
      toast({
        title: "Access Denied",
        description: "Only owner can edit admins",
        variant: "destructive",
      })
      return
    }

    setSelectedAdmin(admin)
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "",
      role: admin.role,
      // Explicitly cast to AdminPermissions to resolve TypeScript type error
      permissions: admin.permissions || { ...ADMIN_CONFIG.DEFAULT_SUB_ADMIN_PERMISSIONS } as AdminPermissions,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateAdmin = async () => {
    if (!selectedAdmin) return

    try {
      // In production, update via API
      setAdmins(admins.map(a => 
        a.id === selectedAdmin.id 
          ? { ...a, ...formData, permissions: formData.permissions }
          : a
      ))
      
      toast({
        title: "Success",
        description: "Admin updated successfully",
      })
      setIsEditDialogOpen(false)
      setSelectedAdmin(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update admin",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (admin: Admin) => {
    if (!isOwner) {
      toast({
        title: "Access Denied",
        description: "Only owner can change admin status",
        variant: "destructive",
      })
      return
    }

    setAdmins(admins.map(a => 
      a.id === admin.id ? { ...a, isActive: !a.isActive } : a
    ))
    
    toast({
      title: "Success",
      description: `Admin ${admin.isActive ? "suspended" : "activated"}`,
    })
  }

  const handleDeleteAdmin = async (admin: Admin) => {
    if (!isOwner) {
      toast({
        title: "Access Denied",
        description: "Only owner can delete admins",
        variant: "destructive",
      })
      return
    }

    if (admin.role === "owner") {
      toast({
        title: "Error",
        description: "Cannot delete owner account",
        variant: "destructive",
      })
      return
    }

    if (!confirm(`Are you sure you want to delete ${admin.name}?`)) return

    setAdmins(admins.filter(a => a.id !== admin.id))
    toast({
      title: "Success",
      description: "Admin deleted successfully",
    })
  }

  const togglePermission = (section: keyof AdminPermissions, action: string) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [section]: {
          ...formData.permissions[section],
          [action]: !formData.permissions[section][action as keyof typeof formData.permissions[typeof section]],
        },
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Users</h1>
          <p className="text-muted-foreground">Manage admins and permissions</p>
        </div>
        {isOwner && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Sub-Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Sub-Admin</DialogTitle>
                <DialogDescription>
                  Create a new sub-admin with limited permissions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Admin Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Password (min 6 characters)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as Admin["role"] })}
                  >
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="support">Support</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <Label>Permissions</Label>
                  <div className="space-y-3 border rounded-lg p-4">
                    {Object.entries(formData.permissions).map(([section, perms]) => (
                      <div key={section} className="space-y-2">
                        <p className="font-medium capitalize">{section}</p>
                        <div className="flex gap-4 ml-4">
                          {Object.entries(perms).map(([action]) => (
                            <div key={action} className="flex items-center gap-2">
                              <Checkbox
                                checked={formData.permissions[section as keyof AdminPermissions][action as keyof typeof perms] as boolean}
                                onCheckedChange={() => togglePermission(section as keyof AdminPermissions, action)}
                              />
                              <Label className="text-sm capitalize">{action}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={handleCreateAdmin} 
                  className="w-full"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create Sub-Admin"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Admins</CardTitle>
          <CardDescription>List of all admin users</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell>{a.email}</TableCell>
                  <TableCell>
                    <Badge variant={a.role === "owner" ? "default" : "secondary"}>
                      {a.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={a.isActive ? "default" : "destructive"}>
                      {a.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(a.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {isOwner && a.role !== "owner" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditAdmin(a)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(a)}
                          >
                            {a.isActive ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteAdmin(a)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogDescription>
              Update admin details and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>New Password (leave empty to keep current)</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-4">
              <Label>Permissions</Label>
              <div className="space-y-3 border rounded-lg p-4">
                {Object.entries(formData.permissions).map(([section, perms]) => (
                  <div key={section} className="space-y-2">
                    <p className="font-medium capitalize">{section}</p>
                    <div className="flex gap-4 ml-4">
                      {Object.entries(perms).map(([action]) => (
                        <div key={action} className="flex items-center gap-2">
                          <Checkbox
                            checked={formData.permissions[section as keyof AdminPermissions][action as keyof typeof perms] as boolean}
                            onCheckedChange={() => togglePermission(section as keyof AdminPermissions, action)}
                          />
                          <Label className="text-sm capitalize">{action}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleUpdateAdmin} className="w-full">
              Update Admin
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
