"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { FloatingCandies } from "@/components/FloatingCandies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUser } from "@/lib/store";
import { Category, Sweet } from "@/lib/types";

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category");

  const [categories, setCategories] = useState<Category[]>([]);
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || "all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const { user } = getUser();
    setIsLoggedIn(!!user);

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.append("name", searchQuery);
    if (selectedCategory && selectedCategory !== "all") params.append("category_id", selectedCategory);
    if (minPrice) params.append("min_price", minPrice);
    if (maxPrice) params.append("max_price", maxPrice);

    fetch(`/api/sweets/search?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setSweets(data.sweets || []);
        setLoading(false);
      });
  }, [searchQuery, selectedCategory, minPrice, maxPrice]);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const handlePurchase = async (sweetId: string) => {
    const { user } = getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    setPurchasing(sweetId);
    try {
      const res = await fetch(`/api/sweets/${sweetId}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: 1 }),
      });

      if (res.ok) {
        setSweets((prev) =>
          prev.map((s) => (s.id === sweetId ? { ...s, quantity: s.quantity - 1 } : s))
        );
        alert("Purchase successful! 🎉");
      } else {
        const data = await res.json();
        alert(data.error || "Purchase failed");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setPurchasing(null);
    }
  };

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
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" className="text-purple-700 hover:text-purple-900">Dashboard</Button>
                  </Link>
                  <Link href="/purchases">
                    <Button variant="ghost" className="text-purple-700 hover:text-purple-900">My Orders</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="text-purple-700 hover:text-purple-900">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-purple-800 mb-8 text-center">
          🍬 Sweet Shop
        </h1>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 border border-pink-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search sweets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-pink-200"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="border-pink-200">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="border-pink-200"
            />
            <Input
              type="number"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="border-pink-200"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl animate-bounce">🍭</div>
            <p className="text-purple-600 mt-4">Loading sweets...</p>
          </div>
        ) : sweets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">😢</div>
            <p className="text-purple-600">No sweets found. Try adjusting your filters!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sweets.map((sweet) => (
              <Card key={sweet.id} className="group hover:shadow-xl transition-all duration-300 border-pink-100 overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-pink-100 to-purple-100">
                  {sweet.image_url && (
                    <Image
                      src={sweet.image_url}
                      alt={sweet.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {sweet.quantity === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">Out of Stock</span>
                    </div>
                  )}
                  {sweet.category && (
                    <span className="absolute top-2 left-2 bg-white/90 text-purple-700 text-xs px-2 py-1 rounded-full">
                      {sweet.category.name}
                    </span>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg text-purple-800 mb-1">{sweet.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{sweet.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-pink-600">${Number(sweet.price).toFixed(2)}</span>
                    <span className="text-sm text-gray-500">{sweet.quantity} left</span>
                  </div>
                  <Button
                    onClick={() => handlePurchase(sweet.id)}
                    disabled={sweet.quantity === 0 || purchasing === sweet.id}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white disabled:opacity-50"
                  >
                    {purchasing === sweet.id ? "Purchasing..." : sweet.quantity === 0 ? "Out of Stock" : "Buy Now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50 flex items-center justify-center">
        <div className="text-4xl animate-bounce">🍭</div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}