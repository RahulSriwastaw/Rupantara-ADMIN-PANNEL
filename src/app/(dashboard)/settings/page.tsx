"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { adminSettingsApi } from "@/services/adminApi"
import { useToast } from "@/hooks/use-toast"
import { Save } from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast()
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [appName, setAppName] = useState("Rupantar AI")
  const [maintenanceMessage, setMaintenanceMessage] = useState("")
  const [estimatedDowntime, setEstimatedDowntime] = useState("")
  const [allowAdminAccess, setAllowAdminAccess] = useState(true)
  const [features, setFeatures] = useState({
    userRegistration: true,
    templateCreation: true,
    pointsPurchase: true,
    aiGeneration: true,
    creatorApplications: true,
    referralProgram: false,
    adRewards: false,
    socialSharing: true,
  })

  const handleSave = async () => {
    try {
      await adminSettingsApi.update({
        appName,
        maintenanceMode,
        maintenanceMessage,
        estimatedDowntime,
        allowAdminAccess,
        features,
      })
      toast({
        title: "Success",
        description: "Settings saved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Configure platform settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Basic platform configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>App Name</Label>
            <Input
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="Rupantar AI"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable to put the platform in maintenance mode
              </p>
            </div>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
            />
          </div>
          {maintenanceMode && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Maintenance Message</Label>
                <Input
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  placeholder="Custom message shown to users"
                />
              </div>
              <div className="space-y-2">
                <Label>Estimated Downtime</Label>
                <Input
                  value={estimatedDowntime}
                  onChange={(e) => setEstimatedDowntime(e.target.value)}
                  placeholder="e.g., 2 hours"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Admin Access</Label>
                  <p className="text-sm text-muted-foreground">Admins can still log in during maintenance</p>
                </div>
                <Switch checked={allowAdminAccess} onCheckedChange={setAllowAdminAccess} />
              </div>
            </div>
          )}
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Toggles</CardTitle>
          <CardDescription>Enable/Disable features globally</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(features).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{
                  key === 'userRegistration' ? 'User registration' :
                  key === 'templateCreation' ? 'Template creation' :
                  key === 'pointsPurchase' ? 'Points purchase' :
                  key === 'aiGeneration' ? 'AI generation' :
                  key === 'creatorApplications' ? 'Creator applications' :
                  key === 'referralProgram' ? 'Referral program' :
                  key === 'adRewards' ? 'Ad rewards' :
                  'Social sharing'
                }</Label>
              </div>
              <Switch
                checked={value}
                onCheckedChange={(checked) => setFeatures((prev) => ({ ...prev, [key]: checked }))}
              />
            </div>
          ))}
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Feature Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

