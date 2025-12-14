"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FloatingCandies } from "@/components/FloatingCandies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAdmin, clearAdmin } from "@/lib/store";
import { Sweet, Category, Admin } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [restockSweet, setRestockSweet] = useState<Sweet | null>(null);
  const [restockQuantity, setRestockQuantity] = useState("");
  const [deleteSweet, setDeleteSweet] = useState<Sweet | null>(null);
  const [newSweet, setNewSweet] = useState({
    name: "",
    description: "",
    category_id: "",
    price: "",
    quantity: "",
    image_url: "",
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const { admin: storedAdmin, token } = getAdmin();
    if (!storedAdmin || !token) {
      router.push("/admin");
      return;
    }
    setAdmin(storedAdmin);

    Promise.all([
      fetch("/api/sweets").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([sweetsData, categoriesData]) => {
      setSweets(sweetsData.sweets || []);
      setCategories(categoriesData.categories || []);
      setLoading(false);
    });
  }, [router]);

  const handleLogout = () => {
    clearAdmin();
    router.push("/admin");
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const sanitizedName = file.name
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9.-]/g, '')
        .toLowerCase();
      const uniqueName = `${Date.now()}-${sanitizedName}`;

      const { data, error } = await supabase.storage
        .from('sweet-images')
        .upload(uniqueName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('sweet-images')
        .getPublicUrl(uniqueName);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleNewImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const preview = URL.createObjectURL(file);
    setNewImagePreview(preview);

    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setNewSweet({ ...newSweet, image_url: imageUrl });
    }
    setUploadingImage(false);
  };

  const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingSweet) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const preview = URL.createObjectURL(file);
    setEditImagePreview(preview);

    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setEditingSweet({ ...editingSweet, image_url: imageUrl });
    }
    setUploadingImage(false);
  };

  const handleAddSweet = async () => {
    const { token } = getAdmin();
    if (!token) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/sweets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newSweet,
          price: parseFloat(newSweet.price),
          quantity: parseInt(newSweet.quantity),
          category_id: newSweet.category_id || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSweets((prev) => [data.sweet, ...prev]);
        setNewSweet({ name: "", description: "", category_id: "", price: "", quantity: "", image_url: "" });
        setNewImagePreview(null);
        setShowAddDialog(false);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSweet = async () => {
    if (!editingSweet) return;
    const { token } = getAdmin();
    if (!token) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/sweets/${editingSweet.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingSweet.name,
          description: editingSweet.description,
          category_id: editingSweet.category_id,
          price: editingSweet.price,
          image_url: editingSweet.image_url,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSweets((prev) => prev.map((s) => (s.id === data.sweet.id ? data.sweet : s)));
        setEditingSweet(null);
        setEditImagePreview(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSweet = async () => {
    if (!deleteSweet) return;
    const { token } = getAdmin();
    if (!token) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/sweets/${deleteSweet.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setSweets((prev) => prev.filter((s) => s.id !== deleteSweet.id));
        setDeleteSweet(null);
      } else {
        alert("Failed to delete sweet");
      }
    } catch {
      alert("Failed to delete sweet");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestock = async () => {
    if (!restockSweet || !restockQuantity) return;
    const { token } = getAdmin();
    if (!token) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/sweets/${restockSweet.id}/restock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: parseInt(restockQuantity) }),
      });

      if (res.ok) {
        const data = await res.json();
        setSweets((prev) => prev.map((s) => (s.id === data.sweet.id ? data.sweet : s)));
        setRestockSweet(null);
        setRestockQuantity("");
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-4xl animate-bounce">🍭</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <FloatingCandies />

      <nav className="relative z-10 bg-slate-800/80 backdrop-blur-md border-b border-purple-500/30 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <span className="text-3xl">🔐</span>
              <span className="text-2xl font-bold text-white">Admin Portal</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-purple-300 text-sm">Welcome, {admin?.name}</span>
              <Link href="/">
                <Button variant="ghost" className="text-purple-300 hover:text-white">View Shop</Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-900/50">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Manage Sweets</h1>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                + Add New Sweet
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-purple-500/30 text-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Sweet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-purple-200">Name</Label>
                  <Input
                    value={newSweet.name}
                    onChange={(e) => setNewSweet({ ...newSweet, name: e.target.value })}
                    className="bg-slate-700 border-purple-500/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-purple-200">Description</Label>
                  <Input
                    value={newSweet.description}
                    onChange={(e) => setNewSweet({ ...newSweet, description: e.target.value })}
                    className="bg-slate-700 border-purple-500/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-purple-200">Category</Label>
                  <Select value={newSweet.category_id} onValueChange={(v) => setNewSweet({ ...newSweet, category_id: v })}>
                    <SelectTrigger className="bg-slate-700 border-purple-500/30 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-purple-200">Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newSweet.price}
                      onChange={(e) => setNewSweet({ ...newSweet, price: e.target.value })}
                      className="bg-slate-700 border-purple-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-purple-200">Quantity</Label>
                    <Input
                      type="number"
                      value={newSweet.quantity}
                      onChange={(e) => setNewSweet({ ...newSweet, quantity: e.target.value })}
                      className="bg-slate-700 border-purple-500/30 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-purple-200">Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleNewImageChange}
                    className="bg-slate-700 border-purple-500/30 text-white"
                    disabled={uploadingImage}
                  />
                  {uploadingImage && <p className="text-purple-300 text-sm mt-1">Uploading...</p>}
                  {newImagePreview && (
                    <div className="mt-2 relative w-full h-40 rounded-lg overflow-hidden">
                      <Image src={newImagePreview} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleAddSweet}
                  disabled={actionLoading || uploadingImage || !newSweet.name || !newSweet.price || !newSweet.quantity}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {actionLoading ? "Adding..." : "Add Sweet"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sweets.map((sweet) => (
            <Card key={sweet.id} className="bg-slate-800/80 border-purple-500/30 overflow-hidden">
              <div className="relative h-40 bg-gradient-to-br from-purple-900 to-pink-900">
                {sweet.image_url && (
                  <Image src={sweet.image_url} alt={sweet.name} fill className="object-cover opacity-80" />
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  {sweet.quantity < 10 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Low Stock</span>
                  )}
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">{sweet.name}</CardTitle>
                <p className="text-purple-300 text-sm">{sweet.category?.name || "Uncategorized"}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-300">Price:</span>
                  <span className="text-pink-400 font-bold">${Number(sweet.price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-300">Stock:</span>
                  <span className={`font-bold ${sweet.quantity < 10 ? "text-red-400" : "text-green-400"}`}>
                    {sweet.quantity} units
                  </span>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-900/50"
                        onClick={() => {
                          setEditingSweet(sweet);
                          setEditImagePreview(null);
                        }}
                      >
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-purple-500/30 text-white max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Sweet</DialogTitle>
                      </DialogHeader>
                      {editingSweet && (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-purple-200">Name</Label>
                            <Input
                              value={editingSweet.name}
                              onChange={(e) => setEditingSweet({ ...editingSweet, name: e.target.value })}
                              className="bg-slate-700 border-purple-500/30 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-purple-200">Description</Label>
                            <Input
                              value={editingSweet.description || ""}
                              onChange={(e) => setEditingSweet({ ...editingSweet, description: e.target.value })}
                              className="bg-slate-700 border-purple-500/30 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-purple-200">Category</Label>
                            <Select
                              value={editingSweet.category_id || "none"}
                              onValueChange={(v) => setEditingSweet({ ...editingSweet, category_id: v === "none" ? null : v })}
                            >
                              <SelectTrigger className="bg-slate-700 border-purple-500/30 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No Category</SelectItem>
                                {categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-purple-200">Price ($)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingSweet.price}
                              onChange={(e) => setEditingSweet({ ...editingSweet, price: parseFloat(e.target.value) })}
                              className="bg-slate-700 border-purple-500/30 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-purple-200">Image</Label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleEditImageChange}
                              className="bg-slate-700 border-purple-500/30 text-white"
                              disabled={uploadingImage}
                            />
                            {uploadingImage && <p className="text-purple-300 text-sm mt-1">Uploading...</p>}
                            {(editImagePreview || editingSweet.image_url) && (
                              <div className="mt-2 relative w-full h-40 rounded-lg overflow-hidden">
                                <Image 
                                  src={editImagePreview || editingSweet.image_url || ""} 
                                  alt="Preview" 
                                  fill 
                                  className="object-cover" 
                                />
                              </div>
                            )}
                          </div>
                          <Button onClick={handleUpdateSweet} disabled={actionLoading || uploadingImage} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                            {actionLoading ? "Updating..." : "Update Sweet"}
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-green-500/30 text-green-300 hover:bg-green-900/50"
                        onClick={() => setRestockSweet(sweet)}
                      >
                        Restock
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-purple-500/30 text-white">
                      <DialogHeader>
                        <DialogTitle>Restock {restockSweet?.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-purple-300">Current stock: {restockSweet?.quantity} units</p>
                        <div>
                          <Label className="text-purple-200">Add Quantity</Label>
                          <Input
                            type="number"
                            value={restockQuantity}
                            onChange={(e) => setRestockQuantity(e.target.value)}
                            placeholder="Enter quantity to add"
                            className="bg-slate-700 border-purple-500/30 text-white"
                          />
                        </div>
                        <Button onClick={handleRestock} disabled={actionLoading || !restockQuantity} className="w-full bg-gradient-to-r from-green-600 to-emerald-600">
                          {actionLoading ? "Restocking..." : "Confirm Restock"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={!!deleteSweet && deleteSweet.id === sweet.id} onOpenChange={(open) => !open && setDeleteSweet(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-300 hover:bg-red-900/50"
                        onClick={() => setDeleteSweet(sweet)}
                      >
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-purple-500/30 text-white">
                      <DialogHeader>
                        <DialogTitle>Delete Sweet</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-purple-300">Are you sure you want to delete {deleteSweet?.name}? This action cannot be undone.</p>
                        <div className="flex gap-2">
                          <Button onClick={() => setDeleteSweet(null)} variant="outline" className="flex-1 border-purple-500/30">
                            Cancel
                          </Button>
                          <Button onClick={handleDeleteSweet} disabled={actionLoading} className="flex-1 bg-gradient-to-r from-red-600 to-rose-600">
                            {actionLoading ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}