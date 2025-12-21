import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input";
import ImageUpload from "../../components/ImageUpload";
import { cn } from "../../utils/helpers";

interface Category {
    name: string;
    slug: string;
    createdAt: string;
}

export default function EventCreate() {
    const [activeTab, setActiveTab] = useState("basic");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Form state for basic info
    const [basicInfo, setBasicInfo] = useState({
        title: "",
        description: "",
        address: "",
        city: "",
        country: "Bangladesh",
        startDate: "",
        endDate: "",
        registrationDeadline: "",
        isOnline: false,
    });

    // State for banner file
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerUrl, setBannerUrl] = useState<string | null>(null);

    // Form state for categories
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [availableCategories, setAvailableCategories] = useState<Category[]>(
        []
    );
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Form state for segments
    const [segments, setSegments] = useState([
        {
            id: 1,
            name: "",
            description: "",
            startTime: "",
            endTime: "",
            capacity: 0,
            category: "",
            isTeamRegistration: false,
        },
    ]);

    // Fetch categories from the backend on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5050/api/categories/all"
                );
                const data = await response.json();

                if (response.ok) {
                    setAvailableCategories(data.categories);
                } else {
                    setError(data.message || "Failed to load categories");
                }
            } catch (err) {
                setError("Failed to load categories");
                console.error("Error fetching categories:", err);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    const handleBasicInfoChange = (name: string, value: string) => {
        setBasicInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleIsOnlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBasicInfo((prev) => ({
            ...prev,
            isOnline: e.target.checked,
        }));
    };

    const handleBannerChange = (file: File | null) => {
        setBannerFile(file);
        if (file) {
            setBannerUrl(URL.createObjectURL(file));
        } else {
            setBannerUrl(null);
        }
    };

    // Function to get available categories (not yet selected)
    const getAvailableCategories = (currentSelection: string | null = null) => {
        const selected = currentSelection
            ? [...selectedCategories, currentSelection]
            : selectedCategories;

        return availableCategories.filter(
            (category) => !selected.includes(category.name)
        );
    };

    // Add a new category selector
    const addCategorySelector = () => {
        setSelectedCategories((prev) => [...prev, ""]);
    };

    // Update a category selection
    const updateCategorySelection = (index: number, value: string) => {
        const newCategories = [...selectedCategories];
        newCategories[index] = value;
        setSelectedCategories(newCategories);
    };

    // Remove a category selection
    const removeCategorySelection = (index: number) => {
        const newCategories = [...selectedCategories];
        newCategories.splice(index, 1);
        setSelectedCategories(newCategories);
    };

    const addSegment = () => {
        setSegments((prev) => [
            ...prev,
            {
                id: Date.now(),
                name: "",
                description: "",
                startTime: "",
                endTime: "",
                capacity: 0,
                category: "",
                isTeamRegistration: false,
            },
        ]);
    };

    const updateSegment = (
        id: number,
        field: string,
        value: string | number | boolean
    ) => {
        setSegments((prev) =>
            prev.map((segment) =>
                segment.id === id ? { ...segment, [field]: value } : segment
            )
        );
    };

    const removeSegment = (id: number) => {
        if (segments.length > 1) {
            setSegments((prev) => prev.filter((segment) => segment.id !== id));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Create FormData for multipart request
            const formData = new FormData();

            // Add basic info
            Object.entries(basicInfo).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });

            // Add banner file if exists
            if (bannerFile) {
                formData.append("banner", bannerFile);
            }

            // Add selected categories (only non-empty ones)
            selectedCategories
                .filter((cat) => cat.trim() !== "")
                .forEach((category) => {
                    formData.append("categoryNames", category);
                });

            // Add segments
            segments.forEach((segment, index) => {
                Object.entries(segment).forEach(([key, value]) => {
                    formData.append(
                        `segments[${index}][${key}]`,
                        value.toString()
                    );
                });
            });

            const response = await fetch(
                "http://localhost:5050/api/events/create",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Failed to create event");
                return;
            }

            // Success - redirect to dashboard
            navigate("/organizer/dashboard");
        } catch (err) {
            setError("An unexpected error occurred");
            console.error("Event creation error:", err);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: "basic", label: "Basic Info" },
        { id: "categories", label: "Categories" },
        { id: "segments", label: "Segments" },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-text-strong">
                    Create New Event
                </h1>
                <p className="text-text-weak">
                    Fill in the details for your new event
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            {/* Tab Navigation */}
            <div className="border-b border-stroke-weak mb-8">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "py-2 px-1 border-b-2 font-medium text-sm",
                                activeTab === tab.id
                                    ? "border-accent text-accent"
                                    : "border-transparent text-text-weak hover:text-text-strong hover:border-stroke-weak"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <form onSubmit={handleSubmit}>
                {activeTab === "basic" && (
                    <div className="space-y-6">
                        <Input
                            label="Event Title"
                            name="title"
                            value={basicInfo.title}
                            onChange={(e) =>
                                handleBasicInfoChange("title", e.target.value)
                            }
                            required
                        />

                        {/* Online Event Checkbox */}
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="isOnline"
                                checked={basicInfo.isOnline}
                                onChange={handleIsOnlineChange}
                                className="w-4 h-4 text-accent rounded focus:ring-accent"
                            />
                            <label
                                htmlFor="isOnline"
                                className="text-text-weak"
                            >
                                Online Event
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Address"
                                name="address"
                                value={basicInfo.address}
                                onChange={(e) =>
                                    handleBasicInfoChange(
                                        "address",
                                        e.target.value
                                    )
                                }
                                required
                            />

                            <Input
                                label="City"
                                name="city"
                                value={basicInfo.city}
                                onChange={(e) =>
                                    handleBasicInfoChange(
                                        "city",
                                        e.target.value
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Country"
                                name="country"
                                value={basicInfo.country}
                                onChange={(e) =>
                                    handleBasicInfoChange(
                                        "country",
                                        e.target.value
                                    )
                                }
                                required
                            />

                            {/* Banner Upload */}
                            <div>
                                <ImageUpload
                                    label="Event Banner"
                                    onFileChange={handleBannerChange}
                                    previewUrl={bannerUrl || undefined}
                                    accept="image/*"
                                    maxSize={10}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="block ml-1">Start Date</label>
                                <input
                                    type="date"
                                    value={basicInfo.startDate}
                                    onChange={(e) =>
                                        handleBasicInfoChange(
                                            "startDate",
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block ml-1">End Date</label>
                                <input
                                    type="date"
                                    value={basicInfo.endDate}
                                    onChange={(e) =>
                                        handleBasicInfoChange(
                                            "endDate",
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block ml-1">
                                    Registration Deadline
                                </label>
                                <input
                                    type="datetime-local"
                                    value={basicInfo.registrationDeadline}
                                    onChange={(e) =>
                                        handleBasicInfoChange(
                                            "registrationDeadline",
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block ml-1">Description</label>
                            <textarea
                                value={basicInfo.description}
                                onChange={(e) =>
                                    handleBasicInfoChange(
                                        "description",
                                        e.target.value
                                    )
                                }
                                className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent min-h-[100px]"
                                required
                            />
                        </div>
                    </div>
                )}

                {/* Categories Tab */}
                {activeTab === "categories" && (
                    <div className="space-y-6">
                        {loadingCategories ? (
                            <div className="text-center py-8">
                                <p className="text-text-weak">
                                    Loading categories...
                                </p>
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
                                            onClick={addCategorySelector}
                                            className="px-4 py-2 bg-accent text-black rounded-lg font-medium"
                                        >
                                            Add Category
                                        </button>
                                    </div>

                                    {selectedCategories.length === 0 ? (
                                        <p className="text-text-weak text-center py-4">
                                            No categories added yet. Click "Add
                                            Category" to get started.
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
                                                        onChange={(e) =>
                                                            updateCategorySelection(
                                                                index,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="flex-1 px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent"
                                                    >
                                                        <option value="">
                                                            Select a category
                                                        </option>
                                                        {getAvailableCategories(
                                                            selectedCategory
                                                        ).map((category) => (
                                                            <option
                                                                key={
                                                                    category.name
                                                                }
                                                                value={
                                                                    category.name
                                                                }
                                                            >
                                                                {category.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeCategorySelection(
                                                                index
                                                            )
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
                )}

                {/* Segments Tab */}
                {activeTab === "segments" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-medium">
                                    Event Segments
                                </h3>
                                <p className="text-sm text-text-weak">
                                    Create individual segments for your event
                                    (e.g., Quiz, Hackathon, Workshop)
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={addSegment}
                                className="px-4 py-2 bg-accent text-black rounded-lg font-medium"
                            >
                                Add Segment
                            </button>
                        </div>

                        {segments.map((segment, index) => (
                            <div
                                key={segment.id}
                                className="border border-zinc-700 rounded-lg p-4"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-medium">
                                        Segment {index + 1}
                                    </h4>
                                    {segments.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeSegment(segment.id)
                                            }
                                            className="text-red-500 hover:text-red-400"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Segment Name"
                                        placeholder="e.g., Tech Quiz, Hackathon, Workshop"
                                        value={segment.name}
                                        onChange={(e) =>
                                            updateSegment(
                                                segment.id,
                                                "name",
                                                e.target.value
                                            )
                                        }
                                        required
                                    />
                                    <Input
                                        label="Category"
                                        placeholder="e.g., Quiz, Competition, Workshop"
                                        value={segment.category}
                                        onChange={(e) =>
                                            updateSegment(
                                                segment.id,
                                                "category",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <Input
                                        label="Capacity"
                                        type="number"
                                        value={segment.capacity.toString()}
                                        onChange={(e) =>
                                            updateSegment(
                                                segment.id,
                                                "capacity",
                                                parseInt(e.target.value) || 0
                                            )
                                        }
                                    />
                                    <div className="space-y-2">
                                        <label className="block ml-1">
                                            Team Registration
                                        </label>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    segment.isTeamRegistration
                                                }
                                                onChange={(e) =>
                                                    updateSegment(
                                                        segment.id,
                                                        "isTeamRegistration",
                                                        e.target.checked
                                                    )
                                                }
                                                className="w-4 h-4 text-accent rounded focus:ring-accent"
                                            />
                                            <span className="ml-2 text-text-weak">
                                                Allow team registrations
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div className="space-y-2">
                                        <label className="block ml-1">
                                            Start Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={segment.startTime}
                                            onChange={(e) =>
                                                updateSegment(
                                                    segment.id,
                                                    "startTime",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block ml-1">
                                            End Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={segment.endTime}
                                            onChange={(e) =>
                                                updateSegment(
                                                    segment.id,
                                                    "endTime",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4">
                                    <label className="block ml-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={segment.description}
                                        onChange={(e) =>
                                            updateSegment(
                                                segment.id,
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent min-h-[60px]"
                                        placeholder="Describe this segment..."
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-8">
                    <button
                        type="button"
                        onClick={() => navigate("/organizer/dashboard")}
                        className="px-6 py-2 rounded-lg bg-zinc-800 text-text-weak font-medium"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 rounded-lg bg-accent text-black font-medium"
                    >
                        {loading ? "Creating..." : "Create Event"}
                    </button>
                </div>
            </form>
        </div>
    );
}
