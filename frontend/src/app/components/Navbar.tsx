"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAdminFromToken } from "../lib/auth";

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
        setIsAdmin(isAdminFromToken());
    }, [pathname]);

    function handleLogout() {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        router.push("/");
    }

    return (
        <nav className="flex gap-6 p-4 border-b items-center">
            <Link href="/" className="font-semibold hover:underline">
                Home
            </Link>
            <Link href="/products" className="font-semibold hover:underline">
                Products
            </Link>
            <Link href="/cart" className="font-semibold hover:underline">
                Cart
            </Link>

            <div className="ml-auto flex gap-4">
                {isLoggedIn ? (
                    <>
                    <Link href="/my-orders" className="font-semibold hover:underline">
                        My Orders
                    </Link>
                    <Link href="/become-seller" className="font-semibold hover:underline">
                        Become a Seller
                    </Link>
                    <Link href="/seller/add-product" className="font-semibold hover:underline">
                        Add Product
                    </Link>  
                    <Link href="/seller/my-products" className="font-semibold hover:underline">
                        My Products
                    </Link> 
                    <Link href="/seller/orders" className="font-semibold hover:underline">
                        Seller Orders
                    </Link> 
                    {isAdmin && (
                        <Link href="/admin" className="font-semibold hover:underline text-red-600">
                            Admin
                        </Link>
                    )}                
                    <button onClick={handleLogout} className="font-semibold hover:underline">
                        Logout
                    </button>
                    </>
                ) : (
                    <>
                    <Link href="/login" className="font-semibold hover:underline">
                        Login
                    </Link>
                    <Link href="/register" className="font-semibold hover:underline">
                        Register
                    </Link>
                    </>
                )}
            </div>
        </nav>
    );
}