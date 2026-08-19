"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "../../lib/auth";
import { API_URL } from "../../lib/api";

export default function ReviewForm({ productId}: {productId: number}) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        
        const token = localStorage.getItem("token");
        const buyerId = getUserIdFromToken();

        if (!token || !buyerId) {
            setError("You must be logged in to leave a review.");
            return;
        }

        const res = await fetch(`${API_URL}/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId, buyerId: 1, rating, comment }),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.message?.[0] || data.message || "Failed to submit review");
            return;
        }

        setComment("");
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4 border-t pt-4">
            <h3 className="font-semibold">Leave a Review</h3>

            <select 
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="border rounded p-2"
            >
                {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                        {n} stars
                    </option>
                ))}
            </select>

            <textarea
                placeholder="Your review"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="border rounded p-2"
                required
            />

            {error && <p className="text-red-600">{error}</p>}

            <button type="submit" className="bg-black text-white rounded p-2">
                Submit Review
            </button>
        </form>
    );
}