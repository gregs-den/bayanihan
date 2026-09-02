"use client";

import { useState, useEffect } from "react";
import AddToCartButton from "./AddToCartButton";
import { formatPrice } from "../lib/format";
import { API_URL } from "../lib/api";

async function getProducts() {
    const res = await fetch(`${API_URL}/products`, {
        cache: 'no-store'
    });
    return res.json();
}

type Product = {
    id: number
    name: string;
    description: string;
    price: string;    
    stock: number;
    averageRating: number | null;
    reviewCount: number;
    imageUrls: string[];
};

type Category = {
    id: number;
    name: string;
};

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCategories() {
            const res = await fetch(`${API_URL}/categories`);
            const data = await res.json();
            setCategories(data);
    }
    loadCategories();
}, []);

    useEffect(() => {
        const controller = new AbortController();

        async function loadProducts() {
            setLoading(true);
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (categoryId) params.set("categoryId", categoryId);
            if (sortBy) params.set("sortBy", sortBy);

            try {
                const res = await fetch(`${API_URL}/products?${params.toString()}`, {
                cache: "no-store",
                signal: controller.signal
                });
                const data = await res.json();
                setProducts(data);
                setLoading(false);
            } catch (err: any) {
                if (err.name !== "AbortError") {
                    setLoading(false);
                }
            }
        }
        loadProducts();

        return () => controller.abort();
    }, [search, categoryId, sortBy]);

    return (
        <main className="min-h-screen p-8">
            <h1 className="text-3xl font-bold mb-6">Products</h1>

            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded p-2 flex-1"
                />
                <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="border rounded p-2"
                >
                    <option value="">All categories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border rounded p-2"
                >
                    <option value="">Sort by</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                </select>
            </div>
            
            {loading ? (
                <p>Loading...</p>
            ) : products.length === 0 ? (
                <p className="text-gray-500">No products found.</p>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4">
                        {product.imageUrls && product.imageUrls.length > 0 ? (
                            <img
                                src={product.imageUrls[0]}
                                alt={product.name}
                                className="w-full h-40 object-cover rounded mb-3"
                            />
                        ) : (
                            <div className="w-full h-40 bg-gray-100 rounded mb-3 flex items-center text-gray-400 text-sm">
                                No image
                            </div>
                        )}
                        <h2 className="text-xl font-semibold">{product.name}</h2>
                        <p className="text-gray-600 mb-2">{product.description}</p>
                        <p className="text-lg font-bold">Php {formatPrice(product.price)}</p>
                        <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                        {product.reviewCount > 0 ? (
                            <p className="text-sm text-yellow-600">
                                ⭐ {product.averageRating?.toFixed(1)} ({product.reviewCount} review{product.reviewCount !== 1? "s" : ""})
                            </p>
                        ) : (
                            <p className="text-sm text-gray-400">No reviews yet</p>
                        )}
                        <AddToCartButton productId={product.id}/>
                    </div>
                ))}
            </div>
            )}
        </main>
    );
}