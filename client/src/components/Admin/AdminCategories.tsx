// client/src/components/admin/Categories.tsx
import { useState, useEffect } from "react";

interface Category {
    name: string;
    slug: string;
    createdAt: string;
}

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5050/api/categories/all"
                );
                const data = await response.json();
                setCategories(data.categories);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!newCategory.trim()) {
            setError("Category name is required");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5050/api/categories",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer admin-token",
                    },
                    body: JSON.stringify({
                        name: newCategory.trim(),
                        slug: newCategory
                            .trim()
                            .toLowerCase()
                            .replace(/\s+/g, "-"),
                    }),
                }
            );

            if (response.ok) {
                setNewCategory("");
                // Refresh the list
                const data = await response.json();
                setCategories((prev) => [...prev, data.category]);
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Failed to add category");
            }
        } catch (error) {
            setError("An unexpected error occurred");
            console.error("Error adding category:", error);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <p className="text-text-weak">Loading categories...</p>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-text-strong mb-6">
                Manage Categories
            </h1>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
                <h2 className="text-lg font-semibold text-text-strong mb-4">
                    Add New Category
                </h2>
                <form
                    onSubmit={handleAddCategory}
                    className="space-y-4"
                >
                    <div>
                        <label className="block ml-1">Category Name</label>
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent"
                            placeholder="Enter category name"
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <button
                        type="submit"
                        className="px-6 py-2 rounded-lg bg-accent text-black font-medium"
                    >
                        Add Category
                    </button>
                </form>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-text-strong mb-4">
                    Existing Categories
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categories.map((category) => (
                        <div
                            key={category.name}
                            className="bg-zinc-800 rounded-lg p-4 border border-zinc-700"
                        >
                            <p className="font-medium text-text-strong">
                                {category.name}
                            </p>
                            <p className="text-xs text-text-weak mt-1">
                                {category.slug}
                            </p>
                            <p className="text-xs text-zinc-500 mt-2">
                                {new Date(
                                    category.createdAt
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
