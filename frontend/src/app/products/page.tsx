import AddToCartButton from "./AddToCartButton";
import { formatPrice } from "../lib/format";
import { API_URL } from "../lib/api";

async function getProducts() {
    const res = await fetch(`${API_URL}/products`, {
        cache: 'no-store'
    });
    return res.json();
}

type Product = {
    id: number
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    stock: number;
};

export default async function ProductsPage() {
    const products: Product[] = await getProducts();

    return (
        <main className="min-h-screen p-8">
            <h1 className="text-3xl font-bold mb-6">Products</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4">
                        <h2 className="text-xl font-semibold">{product.name}</h2>
                        <p className="text-gray-600 mb-2">{product.description}</p>
                        <p className="text-lg font-bold">Php {formatPrice(product.price)}</p>
                        <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                        <AddToCartButton productId={product.id}/>
                    </div>
                ))}
            </div>
        </main>
    )
}