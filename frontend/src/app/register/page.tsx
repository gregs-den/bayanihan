"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        const res = await fetch("http://localhost:3000/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.message || "Registration failed");
            return;
        }

        router.push("/login");
    } 

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8">
            <h1 className="text-3xl font-bold mb-6">Register</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border rounded p-2"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border rounded p-2"
                    required
                />
                {error && <p className="text-red-600">{error}</p>}
                <button type="submit" className="bg-black text-white rounded p-2">
                    Register
                </button>
            </form>
        </main>
    );
}