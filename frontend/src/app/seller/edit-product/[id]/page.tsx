"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function EditProductPage({
    params,
}: {
    params: Promise<{ id: string}>;
}) {
    const { id } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [stock, setStock] = useState("");

    useEffect(() => {
        async function loadProduct() {
            const res = await fetch(`http://localhost:3000/products/${id}`);
            const data = await res.json();

            setName(data.name);
            setDescription(data.description);
            setPrice(data.price);
            setImageUrl(data.imageUrl);
            setStock(data.stock);
            setLoading(false);            
        }

        loadProduct();
    }, [id]);

    async function handleSubmit(e:React.FormEvent) {
        e.preventDefault();
        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
            setError("You must be logged in.");
            return;
        }

        const res = await fetch(`http://localhost:3000/products/${id}`,{
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name,
                description,
                price: Number(price),
                imageUrl,
                stock: Number(stock),
            }),        
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.message?.[0] || data.message || "Failed to upgrade product");
            return;
        }

        setSuccess(true);
        setTimeout(() => router.push("/seller/my-products"), 1500);
    }

    if (loading) return <main className="p-8">Loading...</main>;

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8">
            <h1 className="text-3xl font-bold mb-6">Edit Product</h1>

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

                {error && <p className="text-red-600">{error}</p>}
                {success && <p className="text-green-600">Product updated! Redirecting...</p>}

                <button type="submit" className="bg-black text-white rounded p-2" disabled={success}>
                    Save Changes
                </button>
            </form>
        </main>
    );
}