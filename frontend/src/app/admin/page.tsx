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

type Category = {
    id: number;
    name: string;
};

type Seller = {
    id: number;
    userId: number;
    storeName: string;
};

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [sellers, setSellers] = useState<Seller[]>([]);

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

        async function loadCategories() {
            const res = await fetch(`${API_URL}/categories`);
            const data = await res.json();
            setCategories(data);
        }

        async function loadSellers() {
            const res = await fetch(`${API_URL}/sellers`);
            const data = await res.json();
            setSellers(data);
        }

        loadUsers();
        loadCategories();
        loadSellers();
    }, []);

    async function handleCreateCategory(e: React.FormEvent) {
        e.preventDefault();
        const token = localStorage.getItem("token");        

        const res = await fetch(`${API_URL}/categories`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name: newCategoryName }),
        });

        if (res.ok) {
            const newCategory = await res.json();
            setCategories((prev) => [...prev, newCategory]);
            setNewCategoryName("");
        }
    }

    async function handleDeleteCategory(id: number) {
        const confirmed = confirm("Delete this category?");
        if (!confirmed) return;

        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/categories/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.ok) {
            setCategories((prev) => prev.filter((c) => c.id !== id));
        }
    }

    async function handleDeleteSeller(id:number) {
        const confirmed = confirm("Delete this seller? This will not delete their products.");
        if (!confirmed) return;
        
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/sellers/admin/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.ok) {
            setSellers((prev) => prev.filter((s) => s.id !== id));""
        } else {
            const data = await res.json();
            alert(data.message || "Failed to delete seller.");
        }
    }

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

            <h2 className="text-2xl font-bold mt-10 mb-4">Manage Categories</h2>

                <form onSubmit={handleCreateCategory} className="flex gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="New category name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="border rounded p-2 flex-1"
                        required
                    />
                    <button type="submit" className="bg-black text-white rounded px-4 py-2">
                        Add
                    </button>
                </form>

                <div className="flex flex-col gap-2">
                        {categories.map((category) => (
                            <div key={category.id} className="flex justify-between items-center border rounded p-2">
                                <span>{category.name}</span>
                                <button
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="text-red-600 hover:underline text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                </div>

            <h2 className="text-2xl font-bold mt-10 mb-4">Manage Sellers</h2>
                <div className="flex flex-col gap-2">
                    {sellers.map((seller) => (
                        <div key={seller.id} className="flex justify-between items-center border rounded p-2">
                            <span>{seller.storeName} (user id: {seller.userId})</span>
                            <button
                                onClick={() => handleDeleteSeller(seller.id)}
                                className="text-red-600 hover:underline text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
                
        </main>
    );
}