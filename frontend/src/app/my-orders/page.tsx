"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "../lib/format";
import { API_URL } from "../lib/api";

type OrderItem = {
    id: number;
    productId: number;
    quantity: number;
    priceAtPurchase: string;
}

type Order = {
    id: number;
    totalAmount: string;
    status: string;
    createdAt: string;
    orderItems: OrderItem[];
};

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadOrders() {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("You must be logged in to view your orders.");
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_URL}/orders/my`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                setError("Failed to load orders.");
                setLoading(false);
                return;
            }

            const data = await res.json();
            setOrders(data);
            setLoading(false);            
        }

        loadOrders();
    }, []);

    if (loading) return <main className="p-8">Loading...</main>;
    if (error) return <main className="p-8 text-red-600">{error}</main>;

    return (
        <main className="min-h-screen p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">My Orders</h1>

            {orders.length === 0 ? (
                <p className="text-gray-500">You haven&apos;t place any orders yet.</p>                
            ) : (
                <div className="flex flex-col gap-4">
                    {orders.map((order) => (
                        <div key={order.id} className="border rounded p-4">
                            <div className="flex justify-between items-center mb-2">
                               <p className="font-semibold">Order #{order.id}</p>
                               <span className="text-sm px-2 py-1 rounded bg-gray-100 capitalize">
                                    {order.status}
                                </span> 
                            </div>
                            <p className="text-gray-500 text-sm mb-2">
                                {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                                {order.orderItems.length} item(s)
                            </p>
                            <p className="font-bold"> Php {formatPrice(order.totalAmount)}</p>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}