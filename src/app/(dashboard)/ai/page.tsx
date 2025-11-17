"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminAIConfigApi } from "@/services/adminApi"
import { useToast } from "@/hooks/use-toast"
import { Settings, CheckCircle, XCircle, Trash2, Play } from "lucide-react"

interface AIConfig {
  _id: string
  provider: string
  name: string
  isActive: boolean
  modelVersion?: string
  costPerImage: number
  lastTested?: string
  testStatus?: 'success' | 'failed' | 'pending'
  testError?: string
  apiKey?: string
  apiSecret?: string
  endpoint?: string
  organizationId?: string
  projectId?: string
}

const PROVIDER_OPTIONS = [
  { value: 'openai', label: 'OpenAI DALL-E 3', endpoint: 'https://api.openai.com/v1/images/generations' },
  { value: 'stability', label: 'Stability AI (SDXL)', endpoint: 'https://api.stability.ai/v1/generation' },
  { value: 'google_gemini', label: 'Google Gemini (Imagen)', endpoint: 'https://us-central1-aiplatform.googleapis.com' },
  { value: 'minimax', label: 'MiniMax AI', endpoint: 'https://api.minimax.chat/v1/text_to_image' },
  { value: 'custom', label: 'Custom API', endpoint: '' },
]

export default function AIConfigPage() {
  const { toast } = useToast()
  const [configs, setConfigs] = useState<AIConfig[]>([])
  const [activeConfig, setActiveConfig] = useState<AIConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    provider: 'openai',
    name: '',
    apiKey: '',
    apiSecret: '',
    endpoint: '',
    organizationId: '',
    projectId: '',
    modelVersion: '',
    costPerImage: 0,
    isActive: false,
  })

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    try {
      setIsLoading(true)
      const allConfigs = await adminAIConfigApi.getAll()
      setConfigs(allConfigs)
      
      const active = allConfigs.find((c: AIConfig) => c.isActive)
      setActiveConfig(active || null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load AI configurations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfigure = (provider: string) => {
    const existing = configs.find(c => c.provider === provider)
    const providerOption = PROVIDER_OPTIONS.find(p => p.value === provider)
    
    if (existing) {
      setFormData({
        provider: existing.provider,
        name: existing.name,
        apiKey: existing.apiKey || '',
        apiSecret: existing.apiSecret || '',
        endpoint: existing.endpoint || providerOption?.endpoint || '',
        organizationId: existing.organizationId || '',
        projectId: existing.projectId || '',
        modelVersion: existing.modelVersion || '',
        costPerImage: existing.costPerImage || 0,
        isActive: existing.isActive || false,
      })
    } else {
      setFormData({
        provider,
        name: providerOption?.label || provider,
        apiKey: '',
        apiSecret: '',
        endpoint: providerOption?.endpoint || '',
        organizationId: '',
        projectId: '',
        modelVersion: '',
        costPerImage: 0,
        isActive: false,
      })
    }
    setConfigDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.apiKey) {
      toast({
        title: "Validation Error",
        description: "Name and API Key are required",
        variant: "destructive",
      })
      return
    }

    try {
      await adminAIConfigApi.create(formData)
      toast({
        title: "Success",
        description: "AI configuration saved successfully",
      })
      setConfigDialogOpen(false)
      loadConfigs()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save configuration",
        variant: "destructive",
      })
    }
  }

  const handleActivate = async (id: string) => {
    try {
      await adminAIConfigApi.activate(id)
      toast({
        title: "Success",
        description: "AI model activated successfully",
      })
      loadConfigs()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to activate model",
        variant: "destructive",
      })
    }
  }

  const handleTest = async (id: string) => {
    try {
      setTestingId(id)
      const result = await adminAIConfigApi.test(id)
      toast({
        title: "Test Successful",
        description: `API is working correctly. Response time: ${result.responseTime}ms`,
      })
      loadConfigs()
    } catch (error: any) {
      toast({
        title: "Test Failed",
        description: error.message || "API test failed",
        variant: "destructive",
      })
      loadConfigs()
    } finally {
      setTestingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this configuration?")) return
    
    try {
      await adminAIConfigApi.delete(id)
      toast({
        title: "Success",
        description: "Configuration deleted successfully",
      })
      loadConfigs()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete configuration",
        variant: "destructive",
      })
    }
  }

  const getProviderLabel = (provider: string) => {
    return PROVIDER_OPTIONS.find(p => p.value === provider)?.label || provider
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Configuration</h1>
        <p className="text-muted-foreground">Configure AI providers for image generation</p>
      </div>

      {activeConfig && (
        <Card>
          <CardHeader>
            <CardTitle>Active Model</CardTitle>
            <CardDescription>Currently serving all generations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge>{activeConfig.name}</Badge>
                <span className="text-sm text-green-600">Active</span>
                {activeConfig.testStatus === 'success' && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                {activeConfig.testStatus === 'failed' && (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Cost: ₹{activeConfig.costPerImage}/image
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!activeConfig && (
        <Card className="border-yellow-500 bg-yellow-500/10">
          <CardContent className="pt-6">
            <p className="text-yellow-600 dark:text-yellow-400">
              ⚠️ No active AI configuration found. Please configure and activate an AI provider.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Available Providers</CardTitle>
          <CardDescription>Configure and manage AI providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {PROVIDER_OPTIONS.map((provider) => {
              const config = configs.find(c => c.provider === provider.value)
              return (
                <Card key={provider.value}>
                  <CardHeader>
                    <CardTitle className="text-lg">{provider.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {config && (
                        <div className="flex items-center gap-2 text-sm">
                          {config.isActive && (
                            <Badge variant="default">Active</Badge>
                          )}
                          {config.testStatus === 'success' && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          {config.testStatus === 'failed' && (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          {config.lastTested && (
                            <span className="text-xs text-muted-foreground">
                              Tested: {new Date(config.lastTested).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleConfigure(provider.value)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {config ? 'Edit' : 'Configure'}
                        </Button>
                        {config && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleTest(config._id)}
                              disabled={testingId === config._id}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Test
                            </Button>
                            {!config.isActive && (
                              <Button 
                                size="sm"
                                onClick={() => handleActivate(config._id)}
                              >
                                Activate
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {configs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Configurations</CardTitle>
            <CardDescription>Manage all AI configurations</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Test Status</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((config) => (
                  <TableRow key={config._id}>
                    <TableCell>{getProviderLabel(config.provider)}</TableCell>
                    <TableCell>{config.name}</TableCell>
                    <TableCell>
                      {config.isActive ? (
                        <Badge>Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {config.testStatus === 'success' && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {config.testStatus === 'failed' && (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      {config.testStatus === 'pending' && (
                        <span className="text-xs text-muted-foreground">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>₹{config.costPerImage}/image</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleTest(config._id)}
                          disabled={testingId === config._id}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        {!config.isActive && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleActivate(config._id)}
                          >
                            Activate
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(config._id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure AI Provider</DialogTitle>
            <DialogDescription>
              Enter API credentials for {getProviderLabel(formData.provider)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value={formData.provider} onValueChange={(value) => {
                const option = PROVIDER_OPTIONS.find(p => p.value === value)
                setFormData({ ...formData, provider: value, endpoint: option?.endpoint || '' })
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_OPTIONS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., OpenAI Production"
              />
            </div>

            <div className="space-y-2">
              <Label>API Key *</Label>
              <Input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="Enter API key"
              />
            </div>

            {formData.provider === 'stability' && (
              <div className="space-y-2">
                <Label>API Secret (Optional)</Label>
                <Input
                  type="password"
                  value={formData.apiSecret}
                  onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                  placeholder="Enter API secret if required"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>API Endpoint</Label>
              <Input
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                placeholder="API endpoint URL"
              />
            </div>

            {(formData.provider === 'openai' || formData.provider === 'dalle') && (
              <div className="space-y-2">
                <Label>Organization ID (Optional)</Label>
                <Input
                  value={formData.organizationId}
                  onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                  placeholder="OpenAI Organization ID"
                />
              </div>
            )}

            {formData.provider === 'google_gemini' && (
              <div className="space-y-2">
                <Label>Project ID *</Label>
                <Input
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  placeholder="Google Cloud Project ID"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Model Version (Optional)</Label>
              <Input
                value={formData.modelVersion}
                onChange={(e) => setFormData({ ...formData, modelVersion: e.target.value })}
                placeholder="e.g., dall-e-3, stable-diffusion-xl-1024-v1-0"
              />
            </div>

            <div className="space-y-2">
              <Label>Cost per Image (₹)</Label>
              <Input
                type="number"
                value={formData.costPerImage}
                onChange={(e) => setFormData({ ...formData, costPerImage: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="isActive">Set as Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
