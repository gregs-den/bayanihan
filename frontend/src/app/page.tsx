import Image from "next/image";

async function getCategories() {
  const res = await fetch('http://localhost:3000/categories', {
    cache: 'no-store',
  });
  return res.json();
}

export default async function Home() {
  const categories = await getCategories();

  return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold mb-4">Bayanihan</h1>
        <p className="text-lg text-gray-600">
          Your multi-seller marketplace, coming soon.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        <ul className="space-y-2">
          {categories.map((category: { id: number; name: string}) => (
            <li key={category.id} className="text-lg">
              {category.name}
            </li>
          ))}
        </ul>
        </main>
  );
}
