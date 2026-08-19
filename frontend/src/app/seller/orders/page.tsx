"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/app/lib/format";
import { API_URL } from "@/app/lib/api";

type OrderItem = {
    id: number;
    orderId: number;
    quantity: number;
    priceAtPurchase: string;
    commissionAmount: string;
    order: {
        id: number;
        status: string;
        createdAt: string;
    };
    product: {
        id: number;
        name: string;        
    };
};

export default function SellerOrdersPage() {
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadItems() {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("You must be logged in.");
                setLoading(false);
                return;
            }
            
            const res = await fetch(`${API_URL}/orders/seller/items`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.message || "Failed to load orders.");
                setLoading(false);
                return;
            }

            const data = await res.json();
            setItems(data);
            setLoading(false);
        }

        loadItems();
    }, []);

    if (loading) return <main className="p-8">Loading...</main>;
    if (error) return <main className="p-8 text-red-600">{error}</main>;

    return (
        <main className="min-h-screen p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Orders for My Products</h1>

            {items.length === 0 ? (
                <p className="text-gray-500">No orders yet.</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {items.map((item) => (
                        <div key={item.id} className="border rounded p-4">
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-semibold">
                                    Order #{item.order.id} - {item.product.name}
                                </p>
                                <span className="text-sm px-2 py-1 rounded bg-gray-100 capitalize">
                                    {item.order.status}
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm mb-2">
                                {new Date(item.order.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                                Qty: {item.quantity} * Php {formatPrice(item.priceAtPurchase)}
                            </p>
                            <p className="text-sm text-gray-500">
                                Your earning: Php {formatPrice(
                                    Number(item.priceAtPurchase) * item.quantity - Number(item.commissionAmount)
                                )}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}