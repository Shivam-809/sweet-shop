"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FloatingCandies } from "@/components/FloatingCandies";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser, clearUser } from "@/lib/store";
import { Purchase } from "@/lib/types";

export default function PurchasesPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { user } = getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    fetch("/api/purchases")
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
              <Link href="/dashboard">
                <Button variant="ghost" className="text-purple-700 hover:text-purple-900">Dashboard</Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-purple-800 mb-8">My Orders 📦</h1>

        {purchases.length === 0 ? (
          <Card className="border-pink-200 text-center py-12">
            <CardContent>
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold text-purple-800 mb-2">No orders yet</h3>
              <p className="text-purple-600 mb-4">Start shopping to see your orders here!</p>
              <Link href="/shop">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
                  Browse Sweets
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <Card key={purchase.id} className="border-pink-200 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 py-3">
                  <CardTitle className="text-sm text-purple-600 flex justify-between">
                    <span>Order #{purchase.id.slice(0, 8)}</span>
                    <span>{new Date(purchase.created_at).toLocaleDateString()}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {purchase.sweet?.image_url && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={purchase.sweet.image_url}
                          alt={purchase.sweet?.name || ""}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-purple-800">{purchase.sweet?.name || "Unknown Sweet"}</h3>
                      <p className="text-sm text-gray-600">Quantity: {purchase.quantity}</p>
                      {purchase.sweet?.category && (
                        <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
                          {purchase.sweet.category.name}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-pink-600">${Number(purchase.total_price).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}