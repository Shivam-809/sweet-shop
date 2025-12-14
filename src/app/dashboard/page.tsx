"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FloatingCandies } from "@/components/FloatingCandies";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser, clearUser } from "@/lib/store";
import { User, Purchase } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { user: storedUser, token } = getUser();
    if (!storedUser || !token) {
      router.push("/login");
      return;
    }
    setUser(storedUser);

    fetch("/api/purchases", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setPurchases(data.purchases || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    clearUser();
    router.push("/");
  };

  const totalSpent = purchases.reduce((sum, p) => sum + Number(p.total_price), 0);
  const totalItems = purchases.reduce((sum, p) => sum + p.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50 flex items-center justify-center">
        <div className="text-4xl animate-bounce">🍭</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50 relative overflow-hidden">
      <FloatingCandies />

      <nav className="relative z-10 bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-3xl">🍭</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 bg-clip-text text-transparent">
                Sweet Shop
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/shop">
                <Button variant="ghost" className="text-purple-700 hover:text-purple-900">Shop</Button>
              </Link>
              <Link href="/purchases">
                <Button variant="ghost" className="text-purple-700 hover:text-purple-900">My Orders</Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-800 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-purple-600">Here&apos;s your sweet shopping summary</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-purple-600">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-pink-600">{purchases.length}</p>
            </CardContent>
          </Card>
          <Card className="border-pink-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-purple-600">Items Purchased</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-purple-600">{totalItems}</p>
            </CardContent>
          </Card>
          <Card className="border-pink-200 bg-gradient-to-br from-amber-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-purple-600">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-amber-600">${totalSpent.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-pink-200">
            <CardHeader>
              <CardTitle className="text-purple-800">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/shop" className="block">
                <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
                  🛒 Browse Sweets
                </Button>
              </Link>
              <Link href="/purchases" className="block">
                <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                  📦 View Order History
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-pink-200">
            <CardHeader>
              <CardTitle className="text-purple-800">Recent Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              {purchases.length === 0 ? (
                <p className="text-purple-600 text-center py-4">
                  No purchases yet. <Link href="/shop" className="text-pink-600 font-semibold">Start shopping!</Link>
                </p>
              ) : (
                <ul className="space-y-2">
                  {purchases.slice(0, 5).map((purchase) => (
                    <li key={purchase.id} className="flex justify-between items-center p-2 bg-pink-50 rounded-lg">
                      <span className="text-purple-800 font-medium">
                        {purchase.sweet?.name || "Unknown Sweet"} x{purchase.quantity}
                      </span>
                      <span className="text-pink-600 font-bold">${Number(purchase.total_price).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
