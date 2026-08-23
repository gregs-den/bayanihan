"use client";

import { useState, useEffect, use } from "react";
import { API_URL } from "../lib/api";
import { isAdminFromToken } from "../lib/auth";

type User = {
    id: number;
    email: string;
    isAdmin: boolean;
    createdAt: string;
};

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadUsers() {
            if (!isAdminFromToken()) {
                setError("You do not have admin access.");
                return;
            }

            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/users/admin/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                setError("Failed to load users.");
                setLoading(false);
                return;
            }

            const data = await res.json();
            setUsers(data);
            setLoading(false);
        }

        loadUsers();
    }, []);

    if (loading) return <main className="p-8">Loading...</main>;
    if (error) return <main className="p-8 text-red-600">{error}</main>;

    return (
        <main className="min-h-screen p-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Admin: All Users</h1>

            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b text-left">
                        <th className="p-2">ID</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Admin</th>
                        <th className="p-2">Joined</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-b">
                            <td className="p-2">{user.id}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">{user.isAdmin ? "Yes" : "No"}</td>
                            <td className="p-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}