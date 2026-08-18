"use client";

import { useState, useEffect } from "react";
import { getUserIdFromToken } from "../../lib/auth";
import Link from "next/link";
import { formatPrice } from "@/app/lib/format";

type Product = {
    id: number;
    sellerId: number;
    name: string;
    description: string;
    price: string;
    stock: number;    
}

export default function MyProductPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    useEffect(() => {
        async function loadData() {
            const userId = getUserIdFromToken();
            if (!userId) {
                setError("You must be logged in.");
                setLoading(false);
                return;
            }

            const [productsRes, sellersRes] = await Promise.all([
                fetch("http://localhost:3000/products"),
                fetch("http://localhost:3000/sellers"),
            ])            

            const allProducts: Product[] = await productsRes.json();
            const allSellers = await sellersRes.json();

            const mySeller = allSellers.find((s: {userId: number}) => s.userId === userId);

            if (!mySeller) {
                setError("You don't have a seller profile yet.");
                setLoading(false);
                return;
            }

            const myProducts = allProducts.filter((p) => p.sellerId === mySeller.id);
            setProducts(myProducts);
            setLoading(false);
        }

        loadData();
    }, []);

    async function handleDelete(productId:number) {
        const confirmed = confirm("Delete this product? This cannot be undone.");
        if (!confirmed) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`http://localhost:3000/products/${productId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.ok) {
            setProducts((prev) => prev.filter((p) => p.id !== productId));
        }
    }

    if (loading) return <main className="p-8">Loading...</main>;
    if (error) return <main className="p-8 text-red-600">{error}</main>;

    return (
        <main className="min-h-screen p-8">
            <h1 className="text-3xl font-bold mb-6">My Products</h1>

            {products.length === 0 ? (
                <p className="text-gray-500"> You haven&apos;t added any products yet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="border rounded-lg p-4">
                            <h2 className="text-xl font-semibold">{product.name}</h2>
                            <p className="text-gray-600 mb-2">{product.description}</p>
                            <p className="text-lg font-bold">Php {formatPrice(product.price)}</p>
                            <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                            <div className="flex gap-4 mt-2 items-center">
                                <Link href={`/seller/edit-product/${product.id}`} className="text-blue-600 hover:underline">
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="text-red-600 hover:underline"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}              
        </main>
    );
}