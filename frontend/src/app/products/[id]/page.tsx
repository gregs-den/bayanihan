import ReviewForm from "./ReviewForm";
import { formatPrice } from "../../lib/format";
import { API_URL } from "../../lib/api";
import Link from "next/link";

async function getProduct(id: string) {
    const res = await fetch(`${API_URL}/products/${id}`, {
        cache: "no-store",
    });
    return res.json();    
}

async function getReviews() {
    const res = await fetch(`${API_URL}/reviews`, {
        cache: "no-store",
    });
    return res.json();    
}

type Review = {
    id:number;
    productId: number;
    buyerId: number;
    rating: number;
    comment: string;
};

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{id: string }>; 
}) {
    const { id } = await params;
    const product = await getProduct(id);
    const AllReviews: Review[] = await getReviews();
    const productReviews = AllReviews.filter((r) => r.productId === Number(id));
    
    return (
        <main className="min-h-screen p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <p className="text-xl font-bold mb-6">Php {formatPrice(product.price)}</p>
            <Link
                href={`/sellers/${product.sellerId}`}
                className="text-blue-600 hover:underline text-sm mb-6 inline-block"
            >
                Visit Store
            </Link>

            <h2 className="text-xl font-semibold mb-3">Reviews</h2>
            <div className="flex flex-col gap-3">
                {productReviews.length === 0 && (
                    <p className="text-gray-500">No reviews yet.</p>
                )}
                {productReviews.map((review) => (
                    <div key={review.id} className="border rounded p-3">
                        <p className="font-semibold">Rating: {review.rating}/5</p>
                        <p>{review.comment}</p>
                        </div>
                ))}
            </div>

            <ReviewForm productId={Number(id)} />
        </main>
    );
}