"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCart, removeFromCart, clearCart, CartItem } from "../lib/cart";
import { getUserIdFromToken } from "../lib/auth";
import { formatPrice } from "../lib/format";
import { API_URL } from "../lib/api";

type Product = {
    id: number;
    name: string;
    price: string;
};

type CartLine = CartItem & { product: Product };

export default function CartPage() {
    const [cartLines, setCartLines] = useState<CartLine[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function loadCart() {
            const cart = getCart();

            const lines: CartLine[] = await Promise.all(
                cart.map(async (item) => {
                    const res = await fetch(`${API_URL}/products/${item.productId}`);
                    const product = await res.json();
                    return { ...item, product };
                })
            );

            setCartLines(lines);
            setLoading(false);            
        }

        loadCart();
    }, []);

    function handleRemove(productId: number) {
        removeFromCart(productId);
        setCartLines((prev) => prev.filter((line) => line.productId !== productId));        
    }

    async function handleCheckout() {
        setError("");

        const token = localStorage.getItem("token");
        const buyerId = getUserIdFromToken();

        if (!token || !buyerId) {
            setError("You must be logged in to check out.");
            return;
        }

        const items = cartLines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
        }));

        const res = await fetch(`${API_URL}/payments/checkout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,                
            },
            body: JSON.stringify({ buyerId, items })
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.message?.[0] || data.message || "Checkout failed");
            return;
        }

        const data = await res.json();
        window.location.href = data.checkoutUrl;

    }

    if (loading) return <main className="p-8">Loading...</main>;

    const total = cartLines.reduce(
        (sum, line) => sum + Number(line.product.price) * line.quantity,
        0
    );

    return (
        <main className="min-h-screen p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Cart</h1>

            {success && (
                <p className="text-green-600 mb-4">Order placed! Redirecting...</p>                
            )}

            {cartLines.length === 0 ? (
                <p className="text-gray-500">Your cart is empty.</p>
            ) : (
                <>
                    <div className="flex flex-col gap-4 mb-6">
                        {cartLines.map((line) => (
                            <div key={line.productId} className="border rounded p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{line.product.name}</p>
                                    <p className="text-gray-600">
                                        Php {formatPrice(line.product.price)} * {line.quantity}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleRemove(line.productId)}
                                    className="text-red-600 hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}                        
                    </div>

                    <p className="text-xl font-bold mb-4">Total: Php {formatPrice(total)}</p>

                    {error && <p className="text-red-600 mb-4">{error}</p>}

                    <button
                        onClick={handleCheckout}
                        className="bg-black text-white rounded p-2 w-full"
                        disabled={success}
                    >
                        Checkout
                    </button>
                </>
            )}
        </main>
    );
}