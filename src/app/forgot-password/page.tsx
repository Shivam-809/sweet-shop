"use client";

import { useState } from "react";
import Link from "next/link";
import { FloatingCandies } from "@/components/FloatingCandies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${redirectUrl}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingCandies />

      <Card className="w-full max-w-md relative z-10 border-pink-200 shadow-xl">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl">🍭</span>
          </Link>
          <CardTitle className="text-2xl bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Reset Password
          </CardTitle>
          <CardDescription className="text-purple-600">
            Enter your email to receive a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="font-semibold text-purple-800 mb-2">Check your email!</h3>
              <p className="text-purple-600 text-sm mb-4">
                If an account exists with {email}, you will receive a password reset link shortly.
              </p>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-purple-800">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
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
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}

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