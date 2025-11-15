"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { adminSettingsApi } from "@/services/adminApi"

export default function WalletPage() {
  const { toast } = useToast()
  const [gateways, setGateways] = useState({
    razorpay: { enabled: true, testMode: true },
    stripe: { enabled: true, testMode: true },
    paypal: { enabled: false, testMode: false },
  })
  const [packages, setPackages] = useState([
    { name: "Mini Pack", price: 9, points: 50, bonus: 0, enabled: true },
    { name: "Pro Pack", price: 49, points: 300, bonus: 50, enabled: true },
    { name: "Ultimate Pack", price: 199, points: 1500, bonus: 300, enabled: true },
  ])
  const [promoCode, setPromoCode] = useState("")
  const [keys, setKeys] = useState({
    stripeSecret: "",
    razorpayKeyId: "",
    razorpayKeySecret: "",
  })

  const saveKeys = async () => {
    try {
      await adminSettingsApi.update({ payment: { keys } })
      toast({ title: "Saved", description: "Gateway keys updated (backend storage required)" })
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to save keys", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wallet & Transactions</h1>
        <p className="text-muted-foreground">Payment gateways, packages and promo codes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Gateways</CardTitle>
            <CardDescription>Enable/disable and test mode</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(gateways).map(([key, cfg]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                  <p className="text-xs text-muted-foreground">Toggle availability and test mode</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Enabled</span>
                    <Switch checked={cfg.enabled} onCheckedChange={(v) => setGateways(prev => ({ ...prev, [key]: { ...prev[key as keyof typeof prev], enabled: v } }))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Test</span>
                    <Switch checked={cfg.testMode} onCheckedChange={(v) => setGateways(prev => ({ ...prev, [key]: { ...prev[key as keyof typeof prev], testMode: v } }))} />
                  </div>
                </div>
              </div>
            ))}
            <Button>Save Gateway Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Promo Codes</CardTitle>
            <CardDescription>Create and manage discount codes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>New Promo Code</Label>
              <Input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="DIWALI50" />
            </div>
            <div className="flex gap-2">
              <Button>Create</Button>
              <Button variant="outline">Disable</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gateway Keys</CardTitle>
          <CardDescription>Configure API keys (stored securely on server)</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2 md:col-span-1">
            <Label>Stripe Secret Key</Label>
            <Input type="password" placeholder="sk_live_..." value={keys.stripeSecret} onChange={(e) => setKeys(k => ({ ...k, stripeSecret: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Razorpay Key ID</Label>
            <Input placeholder="rzp_live_..." value={keys.razorpayKeyId} onChange={(e) => setKeys(k => ({ ...k, razorpayKeyId: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Razorpay Key Secret</Label>
            <Input type="password" placeholder="********" value={keys.razorpayKeySecret} onChange={(e) => setKeys(k => ({ ...k, razorpayKeySecret: e.target.value }))} />
          </div>
          <div className="md:col-span-3">
            <div className="text-xs text-muted-foreground mb-2">Keys are never shown back. Use test keys in non-production. Backend must persist to env or vault.</div>
            <Button onClick={saveKeys}>Save Keys</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Points Packages</CardTitle>
          <CardDescription>Edit existing packages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {packages.map((p, idx) => (
            <div key={idx} className="grid grid-cols-5 gap-3 items-center">
              <Input value={p.name} onChange={(e) => setPackages(prev => prev.map((x,i) => i===idx ? { ...x, name: e.target.value } : x))} />
              <Input type="number" value={p.price} onChange={(e) => setPackages(prev => prev.map((x,i) => i===idx ? { ...x, price: Number(e.target.value) } : x))} />
              <Input type="number" value={p.points} onChange={(e) => setPackages(prev => prev.map((x,i) => i===idx ? { ...x, points: Number(e.target.value) } : x))} />
              <Input type="number" value={p.bonus} onChange={(e) => setPackages(prev => prev.map((x,i) => i===idx ? { ...x, bonus: Number(e.target.value) } : x))} />
              <div className="flex items-center gap-2">
                <span className="text-xs">Enabled</span>
                <Switch checked={p.enabled} onCheckedChange={(v) => setPackages(prev => prev.map((x,i) => i===idx ? { ...x, enabled: v } : x))} />
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <Button>Save Packages</Button>
            <Button variant="outline">Add New Package</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
