"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "../lib/auth";
import { API_URL } from "../lib/api";

export default function SellPage() {
    const [storeName, setStoreName] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    async function handleSubmit(e:React.FormEvent) {
        e.preventDefault();
        setError("");

        const token = localStorage.getItem("token");
        const userId = getUserIdFromToken();

        if (!token || !userId) {
            setError("You must be logged in to become a seller.");
            return;
        }

        const res = await fetch(`${API_URL}/sellers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId, storeName})
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.message?.[0] || data.message || "Failed to create seller profile");
            return;
        }

        setSuccess(true);
        setTimeout(() => router.push("/"), 1500);        
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8">
            <h1 className="text-3xl font-bold mb-6">Become a Seller</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
                <input
                    type="text"
                    placeholder="Store name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="border rounded p-2"
                    required
                />
                {error && <p className="text-red-600">{error}</p>}
                {success && (
                    <p className="text-green-600">Seller profile created! Redirecting...</p>
                )}
                <button type="submit" className="bg-black text-white rounded p-2" disabled={success}>
                    Create Seller Profile
                </button>
            </form>
        </main>
    );
}