"use client"

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "../../lib/auth";
import { API_URL } from "@/app/lib/api";

type Category = {
    id: number;
    name: string;
}

export default function AddProductPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [sellerId, setSellerId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [stock, setStock] = useState("");
    const [categoryId, setCategoryId] = useState("");

    useEffect(() => {
        async function loadData() {
            const userId = getUserIdFromToken();
            if (!userId) {
                setError("You must logged in.");
                setLoading(false);
                return;
            }

            const [categoriesRes, sellerRes] = await Promise.all([
                fetch(`${API_URL}/categories`),
                fetch(`${API_URL}/sellers`),
            ]);

            const categoriesData = await categoriesRes.json();
            const sellersData = await sellerRes.json();

            setCategories(categoriesData);

            const mySeller = sellersData.find((s: { userId: number }) => s.userId === userId);
            if (!mySeller) {
                setError("You don't have a seller profile yet.");
            } else {
                setSellerId(mySeller.id);
            }

            setLoading(false);            
        }

        loadData();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        const token = localStorage.getItem("token");
        if (!token || !sellerId) {
            setError("Unable to submit - missing login or seller profile.");
            return;
        }

        const res = await fetch(`${API_URL}/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                sellerId,
                categoryId: Number(categoryId),
                name,
                description,
                price: Number(price),
                imageUrl,
                stock: Number(stock),
            }),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.message?.[0] || data.message || "Failed to add product");
            return;
        }

        setSuccess(true);
        setTimeout(() => router.push("/products"), 1500);        
    }
    
    if (loading) return <main className="p-8">Loading...</main>;

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8">
            <h1 className="text-3xl font-bold mb-6">Add Product</h1>

            {error && !sellerId && <p className="text-red-600">{error}</p>}
            
            {sellerId && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
                    <input
                        type="text"
                        placeholder="Product name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border rounded p-2"
                        required
                    />
                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="border rounded p-2"
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="border rounded p-2"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Image URL" 
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="border rounded p-2"
                    />
                    <input 
                        type="number"
                        placeholder="Stock"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="border rounded p-2"
                        required
                    />
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="border rounded p-2"
                        required
                    >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>

                    {error && <p className="text-red-600">{error}</p>}
                    {success && <p className="text-green-600">Product added! Redirecting...</p>}

                    <button type="submit" className="bg-black text-white rounded p-2" disabled={success}>
                        Add Product
                    </button>
                </form>
            )}
        </main>
    );
}
