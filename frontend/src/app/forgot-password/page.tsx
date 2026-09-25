"use client";

import { useState } from "react";
import { API_URL } from "../lib/api";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setMessage("");

        const res = await fetch(`${API_URL}/users/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (res.ok) {
            setError(data.message || "Something went wrong.");
            return;
        }

        setMessage(data.message);
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8">
            <h1 className="text-3xl font-bold mb-6">Forgot Password</h1>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
                <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                {error && <p className="text-red-600">{error}</p>}
                {message && <p className="text-green-600">{message}</p>}
                <button type="submit" className="bg-black text-white rounded p-2">
                    Send Reset Link
                </button>
            </form>
        </main>
    );
}