"use client";

import { useState, useEffect, use } from "react";
import { API_URL } from "../lib/api";
import { isAdminFromToken } from "../lib/auth";
import { formatPrice } from "../lib/format";

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
    isActive: boolean;
};

type AdminProduct = {
    id: number;
    name: string;
    price: string;
    stock: number;
    seller: {
        storeName: string;
        isActive: boolean;
    };
};

type AdminOrderItem = {
    id: number;
    quantity: number;
    priceAtPurchase: string;
    seller: { storeName: string };
}

type AdminOrder = {
    id: number;
    totalAmount: string;
    status: string;
    createdAt: string;
    buyer: { email: string };
    orderItems: AdminOrderItem[];
};

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [userSearch, setUserSearch] = useState("");
    const [adminProducts, setAdminProducts] = useState<AdminProduct[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [adminOrders, setAdminOrders] = useState<AdminOrder[]>([]);
    const [orderSearch, setOrderSearch] = useState("");

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

        async function loadAdminProducts() {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/products/admin/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setAdminProducts(data);
        }

        async function loadAdminOrders() {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/orders/admin/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setAdminOrders(data);
        }

        loadUsers();
        loadCategories();
        loadSellers();
        loadAdminProducts();
        loadAdminOrders();
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
            setSellers((prev) => prev.filter((s) => s.id !== id));
            alert("Seller deleted successfully.");
        } else {
            const data = await res.json();
            alert(data.message || "Failed to delete seller.");
        }
    }

    async function handleToggleAdmin(id:number, currentStatus: boolean) {
        const token = localStorage.getItem("token");
        
        const res = await fetch(`${API_URL}/users/admin/${id}/toggle-admin`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ isAdmin: !currentStatus }),
        });

        if (res.ok) {
            const updated = await res.json();
            setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
        } else {
            const data = await res.json();
            alert(data.message || "Failed to update admin status.");
        }
    }

    async function handleToggleActive(id: number, currentStatus: boolean) {
        const token = localStorage.getItem("token");
        
        const res = await fetch(`${API_URL}/sellers/admin/${id}/toggle-active`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ isActive: !currentStatus }),
        });

        if (res.ok) {
            const updated = await res.json();
            setSellers((prev) => prev.map((s) => (s.id === id ? updated : s)));
            alert(updated.isActive ? "Seller activate." : "Seller deactivated.");
        } else {
            const data = await res.json();
            alert(data.message || "Failed to update seller status.");
        }
    }

    async function handleDeleteUser(id: number) {
        const confirmed = confirm("Delete this user? this cannot be undone.");
        if (!confirmed) return;
        
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/users/admin/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.ok) {
            setUsers((prev) => prev.filter((u) => u.id !== id));
            alert("User deleted successfully.");
        } else {
            const data = await res.json();
            alert(data.message || "Failed to delete user.");
        }
    }

    if (loading) return <main className="p-8">Loading...</main>;
    if (error) return <main className="p-8 text-red-600">{error}</main>;

    return (
        <main className="min-h-screen p-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Admin: All Users</h1>
            
            <input 
                type="text"
                placeholder="Search users by email"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="border rounded p-2 mb-3 w-full max-w-sm"
            />

            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b text-left">
                        <th className="p-2">ID</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Admin</th>
                        <th className="p-2">Joined</th>
                        <th className="p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users
                        .filter((u) => u.email.toLowerCase().includes(userSearch.toLowerCase()))
                        .map((user) => (
                            <tr key={user.id} className="border-b">
                                <td className="p-2">{user.id}</td>
                                <td className="p-2">{user.email}</td>
                                <td className="p-2">{user.isAdmin ? "Yes" : "No"}</td>
                                <td className="p-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="p-2 flex gap-3">
                                    <button
                                        onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        {user.isAdmin ? "Demote" : "Promote"}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="text-red-600 hover:underline text-sm"
                                    >
                                        Delete
                                    </button>
                                </td>
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
                            <span>
                                {seller.storeName} (user id: {seller.userId})
                                {!seller.isActive && <span className="text-red-500 text-sm ml-2">(Inactive)</span>}
                            </span>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleToggleActive(seller.id, seller.isActive)}
                                    className="text-blue-600 hover:underline text-sm"
                                >
                                    {seller.isActive ? "Deactivate" : "Activate"}
                                </button>
                                <button
                                    onClick={() => handleDeleteSeller(seller.id)}
                                    className="text-red-600 hover:underline text-sm"
                                >
                                Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            <h2 className="text-2xl font-bold mt-10 mb-4">Manage Products</h2>
            <input 
                type="text"
                placeholder="Search products by name..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="border rounded p-2 mb-3 w-full max-w-sm"
            />

            <div className="flex flex-col gap-2">
                {adminProducts
                    .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                    .map((product) => (
                        <div key={product.id} className="flex justify-between items-center border rounded p-2">
                            <span>
                                {product.name} - ₱{formatPrice(product.price)} (Stock: {product.stock})
                                <span className="text-gray-500 text-sm ml-2">
                                    by {product.seller.storeName}
                                    {!product.seller.isActive && (
                                        <span className="text-red-500 ml-1">(seller inactive)</span>
                                    )}
                                </span>
                            </span>
                        </div>
                    ))}
            </div>

            <h2 className="text-2xl font-bold mt-10 mb-4">Manage Orders</h2>
            <input
                type="text"
                placeholder="Search by order ID or buyer email..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="border rounded p-2 mb-3 w-full max-w-sm"
            />

            <div className="flex flex-col gap-3">
                {adminOrders
                    .filter((o) =>
                        o.id.toString().includes(orderSearch) ||
                        o.buyer.email.toLowerCase().includes(orderSearch.toLowerCase())
                    )
                    .map((order) => (
                        <div key={order.id} className="border rounded p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold">
                                    Order #{order.id} - {order.buyer.email}
                                </span>
                                <span className="text-sm px-2 py-1 rounded bg-gray-100 capitalize">
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-1">
                                {new Date(order.createdAt).toLocaleString()}
                            </p>
                            <p className="font-bold mb-1">Total: ₱{formatPrice(order.totalAmount)}</p>
                            <div className="text-sm text-gray-600">
                                {order.orderItems.map((item) => (
                                    <div key={item.id}>
                                        {item.quantity} x ₱{formatPrice(item.priceAtPurchase)} - sold by {item.seller.storeName}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
            </div>
        </main>
    );
}
