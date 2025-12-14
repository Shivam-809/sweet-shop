"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FloatingCandies } from "@/components/FloatingCandies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { saveUser } from "@/lib/store";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsReady(true);
        setUserEmail(session.user.email || "");
      } else {
        setError("Invalid or expired reset link. Please request a new one.");
        setIsReady(true);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      const updateRes = await fetch("/api/auth/user/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail, password: password }),
      });

      if (!updateRes.ok) {
        setError("Password reset successful but update failed. Please try logging in manually.");
        setLoading(false);
        return;
      }

      const { user, token } = await updateRes.json();
      saveUser(user, token);

      setSuccess(true);
      setLoading(false);
      
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50 flex items-center justify-center">
        <div className="text-4xl animate-bounce">🍭</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
        <FloatingCandies />
        <Card className="w-full max-w-md relative z-10 border-pink-200 shadow-xl">
          <CardContent className="pt-6">
            <div className="text-center py-4">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="font-semibold text-purple-800 mb-2">Password reset successfully!</h3>
              <p className="text-purple-600 text-sm mb-4">
                Redirecting you to dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !password && !confirmPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
        <FloatingCandies />
        <Card className="w-full max-w-md relative z-10 border-pink-200 shadow-xl">
          <CardContent className="pt-6">
            <div className="text-center py-4">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="font-semibold text-purple-800 mb-2">Link Expired</h3>
              <p className="text-purple-600 text-sm mb-4">{error}</p>
              <Link href="/forgot-password">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
                  Request New Link
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingCandies />

      <Card className="w-full max-w-md relative z-10 border-pink-200 shadow-xl">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl">🍭</span>
          </Link>
          <CardTitle className="text-2xl bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-purple-600">
            Enter your new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-purple-800">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="border-pink-200 focus:border-purple-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-purple-800">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="border-pink-200 focus:border-purple-400"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-purple-600">
            Remember your password?{" "}
            <Link href="/login" className="text-pink-600 font-semibold hover:text-pink-700">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}