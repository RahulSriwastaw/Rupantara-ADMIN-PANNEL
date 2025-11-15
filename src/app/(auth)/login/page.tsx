"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuthStore } from "@/store/adminAuthStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Lock, Mail } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAdminAuthStore()
  
  console.log('Login page - isAuthenticated:', isAuthenticated)
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Wait for Zustand to hydrate
    const timer = setTimeout(() => {
      console.log('Login page useEffect - isAuthenticated:', isAuthenticated);
      if (isAuthenticated) {
        console.log('User is authenticated, redirecting to dashboard from login page');
        router.replace("/")
      } else {
        console.log('User is NOT authenticated on login page');
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Direct login without 2FA for production
      await login(email, password)
      toast({ title: 'Login successful', description: 'Welcome to the admin panel' })
      router.replace("/")
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative h-16 w-16">
              <Image
                src="/logo.png"
                alt="Rupantar AI"
                width={64}
                height={64}
                className="object-contain"
                priority
                unoptimized
              />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Admin Panel</CardTitle>
          <CardDescription>
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email / ID</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="text"
                  placeholder="Rahul@Malik"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-xs text-muted-foreground text-center mt-4">
              <p className="font-semibold mb-2">Super Admin Credentials:</p>
              <p>ID: Rahul@Malik</p>
              <p>Password: Rupantramalik@rahul</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

