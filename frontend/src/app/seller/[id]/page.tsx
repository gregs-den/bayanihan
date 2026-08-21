import { API_URL } from "../../lib/api";
import { formatPrice } from "../../lib/format";

type Seller = {
    id: number;
    storeName: string;
};

type Product = {
    id: number;
    name: string;
    description: string;
    price: string;
    stock: number;
};

async function getSeller(id:string) {
    const res = await fetch(`${API_URL}/sellers${id}`, { cache: "no-store"});
    return res.json();
}

async function getSellerProducts(id:string) {
    const res = await fetch(`${API_URL}/products?sellerId=${id}`, { cache: "no-store"});
    return res.json();    
}

export default async function SellerStorefrontPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const seller: Seller = await getSeller(id);
    const products: Product[] = await getSellerProducts(id);
    
    return (
        <main className="min-h-screen p-8">
            <h1 className="text-3xl font-bold mb-2">{seller.storeName}</h1>
            <p className="text-gray-500 mb-6">{products.length} product(s)</p>

            {products.length === 0 ? (
                <p className="text-gray-500">This store has no products yet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="border rounded-lg p-4">
                            <h2 className="text-xl font-semibold">{product.name}</h2>
                            <p className="text-gray-600 mb-2">{product.description}</p>
                            <p className="text-lg font-bold">Php {formatPrice(product.price)}</p>
                            <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}