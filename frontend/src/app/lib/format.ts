export function formatPrice(price: number | string): string {
    const num = typeof price === "string" ? Number(price) : price;
    return num.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}