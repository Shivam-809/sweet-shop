"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FloatingCandies } from "@/components/FloatingCandies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { saveAdmin } from "@/lib/store";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      saveAdmin(data.admin, data.token);
      router.push("/admin/dashboard");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingCandies />

      <Card className="w-full max-w-md relative z-10 bg-slate-800/90 border-purple-500/30 shadow-2xl">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl">🔐</span>
          </Link>
          <CardTitle className="text-2xl text-white">Admin Login</CardTitle>
          <CardDescription className="text-purple-300">
            Access the Sweet Shop management portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-purple-200">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sweetshop.com"
                required
                className="bg-slate-700 border-purple-500/30 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-purple-200">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                className="bg-slate-700 border-purple-500/30 text-white placeholder:text-slate-400"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-900/30 p-2 rounded">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In to Admin Portal"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/admin/setup" className="text-sm text-purple-400 hover:text-purple-300">
              New admin? Set up admin credentials
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-slate-400 hover:text-white">
              ← Back to Sweet Shop
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
