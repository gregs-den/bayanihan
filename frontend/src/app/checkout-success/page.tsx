"use client";

import { useEffect } from "react";
import Link from "next/link";
import { clearCart } from "../lib/cart";

export default function CheckoutSuccessPage() {
    useEffect(() => {
        clearCart();
    }, []);

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Payment Successful! 🎉</h1>
            <p className="text-gray-600 mb-6">
                Thank you for your oder. You can track its status in My Orders.
            </p>
            <div className="flex gap-4">
                <Link href="my-orders" className="bg-black text-white rounded px-4 py-2">
                    View My Orders
                </Link>
                <Link href="/products" className="border rounded px-4 py-2">
                    Continue Shopping
                </Link>
            </div>
        </main>
    );
}