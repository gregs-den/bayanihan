"use client";

import { useState } from "react";
import { addToCart } from "../lib/cart";

export default function AddToCartButton({ productId}: { productId: number}) {
    const [added, setAdded] = useState(false);

    function handleClick() {
        addToCart(productId, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    }

    return (
        <button
            onClick={handleClick}
            className="mt-2 bg-black text-white rounded px-3 py-1 text-sm"
        >
            {added ? "Added!" : "Add to Cart"}
        </button>
    );
}