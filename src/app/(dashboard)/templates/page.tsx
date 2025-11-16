"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import { adminTemplatesApi } from "@/services/adminApi"
import { useToast } from "@/hooks/use-toast"
import { Search, CheckCircle, XCircle, Trash2, CheckCheck, Eye, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import * as Tabs from "@radix-ui/react-tabs"
import { Label } from "@/components/ui/label"

interface Template {
  id: string
  title: string
  category: string
  creatorName: string
  status: "approved" | "pending" | "rejected"
  usageCount: number
  likeCount: number
  createdAt: string
}

export default function TemplatesPage() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<any>({
    title: "",
    description: "",
    category: "",
    subCategory: "",
    tagsText: "",
    type: "free",
    ageGroup: "",
    state: "",
    isActive: true,
    demoFile: null as File | null,
    exampleImages: [] as string[],
    visiblePrompt: "",
    hiddenPrompt: "",
    negativePrompt: "",
    pointsCost: 0,
  })

  useEffect(() => {
    loadTemplates()
  }, [statusFilter])

  const loadTemplates = async () => {
    setIsLoading(true)
    try {
      // Fetch templates from real API
      const filters: any = {}
      if (statusFilter !== 'all') filters.status = statusFilter
      
      const templatesData = await adminTemplatesApi.getAll(filters)
      
      // Format templates to match the expected structure
      const formattedTemplates: Template[] = Array.isArray(templatesData) 
        ? templatesData.map((t: any) => ({
            id: t.id || t._id || '',
            title: t.title || 'Untitled',
            category: t.category || 'Uncategorized',
            creatorName: t.creatorName || t.creator?.name || 'Unknown',
            status: t.status || 'pending',
            usageCount: t.usageCount || 0,
            likeCount: t.likeCount || 0,
            createdAt: t.createdAt || new Date().toISOString(),
          }))
        : []
      
      setTemplates(formattedTemplates)
    } catch (error: any) {
      console.error('Error loading templates:', error)
      setTemplates([])
      toast({
        title: "Error",
        description: error.message || "Failed to load templates",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.creatorName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || template.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleApprove = async (id: string) => {
    try {
      await adminTemplatesApi.approve(id)
      setTemplates(templates.map(t => t.id === id ? { ...t, status: "approved" as const } : t))
      toast({
        title: "Success",
        description: "Template approved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to approve template",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (id: string) => {
    try {
      await adminTemplatesApi.reject(id)
      setTemplates(templates.map(t => t.id === id ? { ...t, status: "rejected" as const } : t))
      toast({
        title: "Success",
        description: "Template rejected successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to reject template",
        variant: "destructive",
      })
    }
  }

  const handleBulkApprove = async () => {
    if (selectedTemplates.length === 0) return
    try {
      await adminTemplatesApi.bulkApprove(selectedTemplates)
      setTemplates(templates.map(t => 
        selectedTemplates.includes(t.id) ? { ...t, status: "approved" as const } : t
      ))
      setSelectedTemplates([])
      toast({
        title: "Success",
        description: `${selectedTemplates.length} templates approved`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to approve templates",
        variant: "destructive",
      })
    }
  }

  const handleBulkReject = async () => {
    if (selectedTemplates.length === 0) return
    try {
      await adminTemplatesApi.bulkReject(selectedTemplates)
      setTemplates(templates.map(t => 
        selectedTemplates.includes(t.id) ? { ...t, status: "rejected" as const } : t
      ))
      setSelectedTemplates([])
      toast({
        title: "Success",
        description: `${selectedTemplates.length} templates rejected`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to reject templates",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return
    try {
      await adminTemplatesApi.delete(id)
      setTemplates(templates.filter(t => t.id !== id))
      toast({
        title: "Success",
        description: "Template deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      })
    }
  }

  const handleCreate = async () => {
    if (!form.title) return
    setIsSubmitting(true)
    try {
      let demoImageUrl: string | undefined
      if (form.demoFile) {
        const uploadRes = await adminTemplatesApi.uploadDemoImage(form.demoFile)
        demoImageUrl = uploadRes?.url || uploadRes?.path || uploadRes?.location
      }
      const payload: any = {
        title: form.title,
        description: form.description,
        category: form.category,
        subCategory: form.subCategory,
        tags: form.tagsText ? form.tagsText.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        demoImage: demoImageUrl,
        exampleImages: form.exampleImages,
        prompt: form.hiddenPrompt,
        visiblePrompt: form.visiblePrompt,
        hiddenPrompt: form.hiddenPrompt,
        negativePrompt: form.negativePrompt,
        isPremium: form.type === 'premium',
        pointsCost: form.type === 'premium' ? Number(form.pointsCost || 0) : 0,
        ageGroup: form.ageGroup,
        state: form.state,
        isActive: !!form.isActive,
        status: 'approved',
      }
      const created = await adminTemplatesApi.create(payload)
      const newItem: Template = {
        id: created.id || created._id || Math.random().toString(36).slice(2),
        title: created.title || payload.title,
        category: created.category || payload.category || 'Uncategorized',
        creatorName: created.creatorName || created.creator?.name || 'Admin',
        status: created.status || 'approved',
        usageCount: created.usageCount || 0,
        likeCount: created.likeCount || 0,
        createdAt: created.createdAt || new Date().toISOString(),
      }
      setTemplates([newItem, ...templates])
      setCreateOpen(false)
      setForm({
        title: "",
        description: "",
        category: "",
        subCategory: "",
        tagsText: "",
        type: "free",
        ageGroup: "",
        state: "",
        isActive: true,
        demoFile: null,
        exampleImages: [],
        visiblePrompt: "",
        hiddenPrompt: "",
        negativePrompt: "",
        pointsCost: 0,
      })
      toast({ title: 'Success', description: 'Template created successfully' })
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create template', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedTemplates(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Template Management</h1>
        <p className="text-muted-foreground">Manage and approve templates</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Templates</CardTitle>
          <div className="flex items-center gap-4">
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
              {selectedTemplates.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleBulkApprove}>
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Approve ({selectedTemplates.length})
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleBulkReject}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject ({selectedTemplates.length})
                  </Button>
                </div>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.length === filteredTemplates.length && filteredTemplates.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTemplates(filteredTemplates.map(t => t.id))
                        } else {
                          setSelectedTemplates([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Likes</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedTemplates.includes(template.id)}
                        onChange={() => toggleSelection(template.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{template.title}</TableCell>
                    <TableCell>{template.category}</TableCell>
                    <TableCell>{template.creatorName}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          template.status === "approved" ? "default" :
                          template.status === "pending" ? "secondary" : "destructive"
                        }
                      >
                        {template.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{template.usageCount}</TableCell>
                    <TableCell>{template.likeCount}</TableCell>
                    <TableCell>{new Date(template.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedTemplate(template); setDetailOpen(true) }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {template.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(template.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(template.id)}
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-3xl w-[95vw]">
          <DialogHeader>
            <DialogTitle>Create Template</DialogTitle>
            <DialogDescription>Manual template creation with full metadata</DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" />
              </div>
              <div className="space-y-2">
                <Label>Category (gender)</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Sub Category</Label>
                <Input value={form.subCategory} onChange={(e) => setForm({ ...form, subCategory: e.target.value })} placeholder="e.g. portrait" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.type === 'premium' && (
                <div className="space-y-2">
                  <Label>Points Cost</Label>
                  <Input type="number" value={form.pointsCost} onChange={(e) => setForm({ ...form, pointsCost: e.target.value })} placeholder="0" />
                </div>
              )}
              <div className="space-y-2">
                <Label>Age Group</Label>
                <Input value={form.ageGroup} onChange={(e) => setForm({ ...form, ageGroup: e.target.value })} placeholder="e.g. adult" />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="e.g. draft" />
              </div>
              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input value={form.tagsText} onChange={(e) => setForm({ ...form, tagsText: e.target.value })} placeholder="tag1, tag2" />
              </div>
              <div className="space-y-2">
                <Label>Demo Image</Label>
                <Input type="file" accept="image/*" onChange={(e) => setForm({ ...form, demoFile: e.target.files?.[0] || null })} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Example Images (optional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[0,1,2].map((i) => (
                    <div key={i} className="space-y-2">
                      <Input type="file" accept="image/*" onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (!f) return
                        const reader = new FileReader()
                        reader.onload = (ev) => {
                          const result = ev.target?.result as string
                          const next = [...form.exampleImages]
                          next[i] = result
                          setForm({ ...form, exampleImages: next })
                        }
                        reader.readAsDataURL(f)
                      }} />
                      {form.exampleImages[i] && (
                        <img src={form.exampleImages[i]} alt="example" className="w-full h-24 object-cover rounded border" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Visible Prompt</Label>
                <Textarea value={form.visiblePrompt} onChange={(e) => setForm({ ...form, visiblePrompt: e.target.value })} rows={2} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Hidden Prompt</Label>
                <Textarea value={form.hiddenPrompt} onChange={(e) => setForm({ ...form, hiddenPrompt: e.target.value })} rows={2} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Negative Prompt</Label>
                <Textarea value={form.negativePrompt} onChange={(e) => setForm({ ...form, negativePrompt: e.target.value })} rows={2} />
              </div>
              <div className="flex items-center gap-2">
                <Label>Active</Label>
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Template Review</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.title} by {selectedTemplate?.creatorName}
            </DialogDescription>
          </DialogHeader>
          <Tabs.Root defaultValue="overview">
            <Tabs.List className="flex gap-2 mb-4">
              <Tabs.Trigger value="overview" className="px-3 py-2 rounded bg-secondary">Overview</Tabs.Trigger>
              <Tabs.Trigger value="preview" className="px-3 py-2 rounded bg-secondary">Preview</Tabs.Trigger>
              <Tabs.Trigger value="metadata" className="px-3 py-2 rounded bg-secondary">Metadata</Tabs.Trigger>
              <Tabs.Trigger value="history" className="px-3 py-2 rounded bg-secondary">Usage History</Tabs.Trigger>
              <Tabs.Trigger value="actions" className="px-3 py-2 rounded bg-secondary">Actions</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="overview">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p>Title: {selectedTemplate?.title}</p>
                  <p>Category: {selectedTemplate?.category}</p>
                  <p>Creator: {selectedTemplate?.creatorName}</p>
                </div>
                <div>
                  <p>Status: {selectedTemplate?.status}</p>
                  <p>Usage: {selectedTemplate?.usageCount}</p>
                  <p>Likes: {selectedTemplate?.likeCount}</p>
                </div>
              </div>
            </Tabs.Content>
            <Tabs.Content value="preview">
              <div className="h-48 rounded bg-muted flex items-center justify-center text-muted-foreground">Template preview</div>
            </Tabs.Content>
            <Tabs.Content value="metadata">
              <div className="space-y-2">
                <Label>Moderation Notes</Label>
                <div className="text-sm text-muted-foreground">Safety checks, tags, and policy compliance</div>
              </div>
            </Tabs.Content>
            <Tabs.Content value="history">
              <div className="text-sm text-muted-foreground">Recent usage and feedback</div>
            </Tabs.Content>
            <Tabs.Content value="actions">
              <div className="flex gap-2">
                <Button onClick={() => { selectedTemplate && handleApprove(selectedTemplate.id); setDetailOpen(false) }}>Approve</Button>
                <Button variant="destructive" onClick={() => { selectedTemplate && handleReject(selectedTemplate.id); setDetailOpen(false) }}>Reject</Button>
              </div>
            </Tabs.Content>
          </Tabs.Root>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

