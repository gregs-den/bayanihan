export type CartItem = {
    productId: number;
    quantity: number;
};

const CART_KEY = "cart";

export function getCart(): CartItem[] {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
}

export function saveCart(cart: CartItem[]) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(productId: number, quantity: number = 1) {
    const cart = getCart();
    const existing = cart.find((item) => item.productId === productId);

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ productId, quantity});
    }

    saveCart(cart);
}

export function removeFromCart(productId: number) {
    const cart = getCart().filter((item) => item.productId !== productId);
    saveCart(cart);
}

export function clearCart() {
    localStorage.removeItem(CART_KEY);
}