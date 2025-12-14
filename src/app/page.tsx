"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FloatingCandies } from "@/components/FloatingCandies";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getUser } from "@/lib/store";
import { Category, Sweet } from "@/lib/types";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredSweets, setFeaturedSweets] = useState<Sweet[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const { user } = getUser();
    setIsLoggedIn(!!user);

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));

    fetch("/api/sweets")
      .then((res) => res.json())
      .then((data) => setFeaturedSweets((data.sweets || []).slice(0, 6)));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50 relative overflow-hidden">
      <FloatingCandies />

      <nav className="relative z-10 bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-3xl">🍭</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 bg-clip-text text-transparent font-[family-name:var(--font-geist-sans)]">
                Sweet Shop
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/shop">
                <Button variant="ghost" className="text-purple-700 hover:text-purple-900">
                  Shop
                </Button>
              </Link>
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" className="text-purple-700 hover:text-purple-900">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/purchases">
                    <Button variant="ghost" className="text-purple-700 hover:text-purple-900">
                      My Orders
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="text-purple-700 hover:text-purple-900">
                      Login
                    </Button>
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

      <main className="relative z-10">
        <section className="py-20 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 bg-clip-text text-transparent">
              Welcome to Sweet Shop
            </h1>
            <p className="text-xl text-purple-700 mb-8 max-w-2xl mx-auto">
              Discover the sweetest collection of candies, chocolates, and treats. 
              Indulge in our handpicked selection of premium sweets from around the world.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/shop">
                <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 text-lg px-8 py-6">
                  Browse Sweets
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50 text-lg px-8 py-6">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-purple-800">
              Shop by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link key={category.id} href={`/shop?category=${category.id}`}>
                  <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-pink-100 hover:border-pink-300 overflow-hidden">
                    <CardContent className="p-4 text-center">
                      <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
                        {category.image_url && (
                          <Image
                            src={category.image_url}
                            alt={category.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        )}
                      </div>
                      <h3 className="font-semibold text-purple-800 group-hover:text-pink-600 transition-colors">
                        {category.name}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-purple-800">
              Featured Sweets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSweets.map((sweet) => (
                <Card key={sweet.id} className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-pink-100 overflow-hidden">
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
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg text-purple-800 mb-1">{sweet.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{sweet.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-pink-600">${sweet.price.toFixed(2)}</span>
                      <span className="text-sm text-gray-500">{sweet.quantity} in stock</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/shop">
                <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600">
                  View All Sweets
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 bg-purple-900 text-white py-12 px-4 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl">🍭</span>
            <span className="text-2xl font-bold">Sweet Shop</span>
          </div>
          <p className="text-purple-200 mb-4">Your one-stop destination for all things sweet!</p>
          <div className="flex justify-center gap-4 text-sm text-purple-300">
            <Link href="/admin" className="hover:text-white">Admin Portal</Link>
            <span>|</span>
            <span>&copy; 2024 Sweet Shop</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
