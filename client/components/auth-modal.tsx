"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function AuthModal({ open, onOpenChange, onAuthenticated }: { open: boolean; onOpenChange: (v: boolean) => void; onAuthenticated?: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

  const submit = async () => {
    setLoading(true)
    setError(null)
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register"
      const body: any = { email, password }
      if (mode === "register") { body.firstName = firstName; body.lastName = lastName }
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok || !json?.data?.token) {
        throw new Error(json?.message || "Authentication failed")
      }
      localStorage.setItem("atmosai_token", json.data.token)
      onOpenChange(false)
      onAuthenticated?.()
    } catch (e: any) {
      setError(e?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open) {
      setError(null)
      setPassword("")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "login" ? "Login" : "Create Account"}</DialogTitle>
          <DialogDescription>
            {mode === "login" ? "Sign in to save settings and events" : "Register to sync your settings and events"}
          </DialogDescription>
        </DialogHeader>

        {mode === "register" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>First name</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
            </div>
            <div className="space-y-2">
              <Label>Last name</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}

        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" onClick={() => setMode(mode === "login" ? "register" : "login")} className="rounded-lg">
            {mode === "login" ? "Create account" : "Have an account? Login"}
          </Button>
          <Button onClick={submit} disabled={loading || !email || !password} className="rounded-lg">
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


