import { cn } from "../../utils/helpers";

interface Category {
    name: string;
    slug: string;
    createdAt: string;
}

interface EventCategoriesProps {
    selectedCategories: string[];
    availableCategories: Category[];
    loadingCategories: boolean;
    onAddCategorySelector: () => void;
    onRemoveCategorySelection: (index: number) => void;
    onUpdateCategorySelection: (index: number, value: string) => void;
}

export default function EventCategories({
    selectedCategories,
    availableCategories,
    loadingCategories,
    onAddCategorySelector,
    onRemoveCategorySelection,
    onUpdateCategorySelection,
}: EventCategoriesProps) {
    // Function to get available categories (not yet selected by other selectors)
    const getAvailableCategories = (currentIndex: number) => {
        // Get all other selected categories except the current one
        const otherSelectedCategories = selectedCategories.filter(
            (_, index) => index !== currentIndex
        );

        return availableCategories.filter(
            (category) => !otherSelectedCategories.includes(category.name)
        );
    };

    return (
        <div className="space-y-6">
            {loadingCategories ? (
                <div className="text-center py-8">
                    <p className="text-text-weak">Loading categories...</p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">
                                Event Categories
                            </h3>
                            <button
                                type="button"
                                onClick={onAddCategorySelector}
                                className="px-4 py-2 bg-accent text-black rounded-lg font-medium"
                            >
                                Add Category
                            </button>
                        </div>

                        {selectedCategories.length === 0 ? (
                            <p className="text-text-weak text-center py-4">
                                No categories added yet. Click "Add Category" to
                                get started.
                            </p>
                        ) : (
                            selectedCategories.map(
                                (selectedCategory, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center space-x-3"
                                    >
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => {
                                                console.log(
                                                    "Selected category:",
                                                    e.target.value
                                                );
                                                onUpdateCategorySelection(
                                                    index,
                                                    e.target.value
                                                );
                                            }}
                                            className="flex-1 px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent"
                                        >
                                            <option value="">
                                                Select a category
                                            </option>
                                            {getAvailableCategories(index).map(
                                                (category) => (
                                                    <option
                                                        key={category.name}
                                                        value={category.name}
                                                    >
                                                        {category.name}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onRemoveCategorySelection(index)
                                            }
                                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )
                            )
                        )}
                    </div>

                    <div className="mt-6">
                        <h4 className="font-medium mb-3">
                            Available Categories
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {availableCategories.map((category) => (
                                <span
                                    key={category.name}
                                    className={cn(
                                        "px-3 py-1 rounded-full text-sm",
                                        selectedCategories.includes(
                                            category.name
                                        )
                                            ? "bg-accent text-black"
                                            : "bg-zinc-800 text-text-weak"
                                    )}
                                >
                                    {category.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
