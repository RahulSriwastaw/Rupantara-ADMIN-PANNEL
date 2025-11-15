"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Save } from "lucide-react"
import { adminSettingsApi } from "@/services/adminApi"

export default function IntegrationsPage() {
  const { toast } = useToast()

  const [analytics, setAnalytics] = useState({
    enabled: false,
    gaMeasurementId: "",
    gtmContainerId: "",
    enableTagManager: false,
  })

  const [ads, setAds] = useState({
    enabled: false,
    adsensePublisherId: "",
    adScriptGlobal: "",
  })

  const [payments, setPayments] = useState({
    razorpay: { enabled: true, testMode: true, keyId: "", keySecret: "" },
    stripe: { enabled: true, testMode: true, secretKey: "" },
    paypal: { enabled: false, testMode: false, clientId: "", clientSecret: "" },
  })

  const handleSave = async () => {
    try {
      await adminSettingsApi.update({
        integrations: {
          analytics,
          ads,
          payments,
        },
      })
      toast({ title: "Success", description: "Integrations settings saved" })
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">Google Analytics, Ads, Payment Gateways</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Google Analytics / Tag Manager</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Analytics</Label>
              <p className="text-sm text-muted-foreground">Track usage with GA4</p>
            </div>
            <Switch checked={analytics.enabled} onCheckedChange={(v) => setAnalytics(prev => ({ ...prev, enabled: v }))} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>GA4 Measurement ID</Label>
              <Input value={analytics.gaMeasurementId} onChange={(e) => setAnalytics(prev => ({ ...prev, gaMeasurementId: e.target.value }))} placeholder="G-XXXXXXXXXX" />
            </div>
            <div className="space-y-2">
              <Label>GTM Container ID</Label>
              <Input value={analytics.gtmContainerId} onChange={(e) => setAnalytics(prev => ({ ...prev, gtmContainerId: e.target.value }))} placeholder="GTM-XXXXXXX" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Tag Manager</Label>
              <p className="text-sm text-muted-foreground">Load GTM scripts globally</p>
            </div>
            <Switch checked={analytics.enableTagManager} onCheckedChange={(v) => setAnalytics(prev => ({ ...prev, enableTagManager: v }))} />
          </div>
          <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Save Analytics</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ads</CardTitle>
          <CardDescription>AdSense / custom ad scripts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Ads</Label>
              <p className="text-sm text-muted-foreground">Show ads on frontend</p>
            </div>
            <Switch checked={ads.enabled} onCheckedChange={(v) => setAds(prev => ({ ...prev, enabled: v }))} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>AdSense Publisher ID</Label>
              <Input value={ads.adsensePublisherId} onChange={(e) => setAds(prev => ({ ...prev, adsensePublisherId: e.target.value }))} placeholder="ca-pub-XXXXXXXXXXXX" />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label>Global Ad Script</Label>
              <Input value={ads.adScriptGlobal} onChange={(e) => setAds(prev => ({ ...prev, adScriptGlobal: e.target.value }))} placeholder="<script>...</script>" />
            </div>
          </div>
          <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Save Ads</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Gateways</CardTitle>
          <CardDescription>Razorpay, Stripe, PayPal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(["razorpay", "stripe", "paypal"] as const).map((key) => {
            const cfg = payments[key]
            return (
              <div key={key} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{key === "razorpay" ? "Razorpay" : key === "stripe" ? "Stripe" : "PayPal"}</Label>
                    <p className="text-sm text-muted-foreground">Enable and configure</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Test</span>
                      <Switch checked={cfg.testMode} onCheckedChange={(v) => setPayments(prev => ({ ...prev, [key]: { ...prev[key], testMode: v } }))} />
                    </div>
                    <Switch checked={cfg.enabled} onCheckedChange={(v) => setPayments(prev => ({ ...prev, [key]: { ...prev[key], enabled: v } }))} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {key === "razorpay" && (
                    <>
                      <div className="space-y-2">
                        <Label>Key ID</Label>
                        <Input value={cfg.keyId} onChange={(e) => setPayments(prev => ({ ...prev, razorpay: { ...prev.razorpay, keyId: e.target.value } }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Key Secret</Label>
                        <Input value={cfg.keySecret} onChange={(e) => setPayments(prev => ({ ...prev, razorpay: { ...prev.razorpay, keySecret: e.target.value } }))} />
                      </div>
                    </>
                  )}
                  {key === "stripe" && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>Secret Key</Label>
                      <Input value={cfg.secretKey} onChange={(e) => setPayments(prev => ({ ...prev, stripe: { ...prev.stripe, secretKey: e.target.value } }))} />
                    </div>
                  )}
                  {key === "paypal" && (
                    <>
                      <div className="space-y-2">
                        <Label>Client ID</Label>
                        <Input value={cfg.clientId} onChange={(e) => setPayments(prev => ({ ...prev, paypal: { ...prev.paypal, clientId: e.target.value } }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Client Secret</Label>
                        <Input value={cfg.clientSecret} onChange={(e) => setPayments(prev => ({ ...prev, paypal: { ...prev.paypal, clientSecret: e.target.value } }))} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
          <div className="flex gap-2">
            <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Save Gateways</Button>
            <Button variant="outline">Manage in Wallet</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}