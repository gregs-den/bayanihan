"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "../lib/api";

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!token) {
            setError("Missing or invalid reset link.");
            return;
        }

        const res = await fetch(`${API_URL}/users/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword }),
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.message || "Failed to reset password.");
            return;
        }

        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8">
            <h1 className="text-3xl font-bold mb-6">Reset Password</h1>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
                <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border rounded p-2"
                    required
                />
                {error && <p className="text-red-600">{error}</p>}
                {success && (
                    <p className="text-green-600">Password reset! Redirecting to login...</p>
                )}
                <button type="submit" className="bg-black text-white rounded p-2" disabled={success}>
                    Reset Password
                </button>
            </form>
        </main>
    );
}