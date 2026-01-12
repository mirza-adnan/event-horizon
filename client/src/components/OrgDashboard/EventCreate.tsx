// client/src/pages/organizer/EventCreate.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EventBasicInfo from "./EventBasicInfo";
import EventCategories from "./EventCategories";
import EventSegments from "./EventSegments";
import { cn } from "../../utils/helpers";

interface Category {
    name: string;
    slug: string;
    createdAt: string;
}

interface Segment {
    id: number;
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    capacity: number;
    categoryId: string;
    isTeamSegment: boolean;
    isOnline: boolean;
    registrationDeadline: string;
    minTeamSize?: number;
    maxTeamSize?: number;
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
    const [segments, setSegments] = useState<Segment[]>([]);

    // Validation errors
    const [basicInfoErrors, setBasicInfoErrors] = useState<
        Record<string, string>
    >({});
    const [segmentErrors, setSegmentErrors] = useState<
        Record<number, Record<string, string>>
    >({});

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

    // Validate basic info fields
    const validateBasicInfo = () => {
        const errors: Record<string, string> = {};

        if (!basicInfo.title.trim()) errors.title = "Title is required";
        if (!basicInfo.description.trim())
            errors.description = "Description is required";
        if (!basicInfo.address.trim()) errors.address = "Address is required";
        if (!basicInfo.city.trim()) errors.city = "City is required";
        if (!basicInfo.startDate) errors.startDate = "Start date is required";

        if (
            basicInfo.endDate &&
            new Date(basicInfo.startDate) > new Date(basicInfo.endDate)
        ) {
            errors.endDate = "End date must be after start date";
        }

        setBasicInfoErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Validate segments
    const validateSegments = () => {
        const errors: Record<number, Record<string, string>> = {};
        let isValid = true;

        segments.forEach((segment) => {
            const segmentErrors: Record<string, string> = {};

            if (!segment.name.trim())
                segmentErrors.name = "Segment name is required";
            if (!segment.startTime)
                segmentErrors.startTime = "Start time is required";
            if (!segment.endTime)
                segmentErrors.endTime = "End time is required";

            if (segment.startTime && segment.endTime) {
                const start = new Date(segment.startTime).getTime();
                const end = new Date(segment.endTime).getTime();

                if (start >= end) {
                    segmentErrors.endTime = "End time must be after start time";
                }
            }

            if (segment.isTeamSegment) {
                if (!segment.minTeamSize || segment.minTeamSize < 1) {
                    segmentErrors.minTeamSize =
                        "Min team size must be at least 1";
                }
                if (!segment.maxTeamSize || segment.maxTeamSize < 1) {
                    segmentErrors.maxTeamSize =
                        "Max team size must be at least 1";
                }
                if (
                    segment.minTeamSize &&
                    segment.maxTeamSize &&
                    segment.minTeamSize > segment.maxTeamSize
                ) {
                    segmentErrors.maxTeamSize =
                        "Max team size cannot be less than min team size";
                }
            }

            if (Object.keys(segmentErrors).length > 0) {
                errors[segment.id] = segmentErrors;
                isValid = false;
            }
        });

        setSegmentErrors(errors);
        return isValid;
    };

    const handleBasicInfoChange = (name: string, value: string) => {
        setBasicInfo((prev) => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (basicInfoErrors[name]) {
            setBasicInfoErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleBannerChange = (file: File | null) => {
        setBannerFile(file);
        if (file) {
            setBannerUrl(URL.createObjectURL(file));
        } else {
            setBannerUrl(null);
        }
    };

    // Category functions
    const addCategorySelector = () => {
        setSelectedCategories((prev) => [...prev, ""]);
    };

    const updateCategorySelection = (index: number, value: string) => {
        const newCategories = [...selectedCategories];
        newCategories[index] = value;
        setSelectedCategories(newCategories);
    };

    const removeCategorySelection = (index: number) => {
        const newCategories = [...selectedCategories];
        newCategories.splice(index, 1);
        setSelectedCategories(newCategories);
    };

    // Segment functions
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
                categoryId: "",
                isTeamSegment: false,
                isOnline: false,
                registrationDeadline: "",
            },
        ]);
    };

    const updateSegment = (
        id: number,
        field: keyof Segment,
        value: string | number | boolean
    ) => {
        setSegments((prev) =>
            prev.map((segment) =>
                segment.id === id ? { ...segment, [field]: value } : segment
            )
        );

        // Clear error when user updates the field
        if (segmentErrors[id] && segmentErrors[id][field]) {
            setSegmentErrors((prev) => {
                const newErrors = { ...prev };
                const segmentError = { ...newErrors[id] };
                delete segmentError[field];

                if (Object.keys(segmentError).length === 0) {
                    delete newErrors[id];
                } else {
                    newErrors[id] = segmentError;
                }

                return newErrors;
            });
        }
    };

    const removeSegment = (id: number) => {
        setSegments((prev) => prev.filter((segment) => segment.id !== id));

        // Clear errors for this segment
        setSegmentErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[id];
            return newErrors;
        });
    };

    // Reset all form fields
    const handleReset = () => {
        setBasicInfo({
            title: "",
            description: "",
            address: "",
            city: "",
            country: "Bangladesh",
            startDate: "",
            endDate: "",
        });
        setBannerFile(null);
        setBannerUrl(null);
        setSelectedCategories([]);
        setSegments([]);
        setBasicInfoErrors({});
        setSegmentErrors({});
        setError(null);
    };

    // Submit event with specified status
    const submitEvent = async (status: "draft" | "published") => {
        // Validate basic info
        if (!validateBasicInfo()) {
            setActiveTab("basic");
            setError("Please fix the errors in the Basic Info section");
            return;
        }

        // Validate segments
        if (!validateSegments()) {
            setActiveTab("segments");
            setError("Please fix the errors in the Segments section");
            return;
        }

        // Check if at least one segment exists
        if (segments.length === 0) {
            setActiveTab("segments");
            setError("At least one segment is required");
            return;
        }

        // Check if at least one category is selected (for published events)
        if (
            status === "published" &&
            selectedCategories.filter((cat) => cat.trim() !== "").length === 0
        ) {
            setActiveTab("categories");
            setError("At least one category is required for published events");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();

            // Add basic info
            formData.append("title", basicInfo.title);
            formData.append("description", basicInfo.description);
            formData.append("address", basicInfo.address);
            formData.append("city", basicInfo.city);
            formData.append("country", basicInfo.country);
            formData.append("startDate", basicInfo.startDate);
            if (basicInfo.endDate)
                formData.append("endDate", basicInfo.endDate);
            formData.append("status", status);

            // Add banner file if exists
            if (bannerFile) {
                formData.append("banner", bannerFile);
            }

            // Add selected categories - append each as a separate field
            selectedCategories
                .filter((cat) => cat.trim() !== "")
                .forEach((category) => {
                    formData.append("categoryNames", category);
                });

            // Add segments as JSON string
            if (segments.length > 0) {
                formData.append("segments", JSON.stringify(segments));
            }

            const response = await fetch(
                "http://localhost:5050/api/events/create",
                {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Failed to create event");
                return;
            }

            // Success - redirect to dashboard
            navigate("/organizers/dashboard");
        } catch (err) {
            setError("An unexpected error occurred");
            console.error("Event creation error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDraft = (e: React.FormEvent) => {
        e.preventDefault();
        submitEvent("draft");
    };

    const handlePublish = (e: React.FormEvent) => {
        e.preventDefault();
        submitEvent("published");
    };

    const tabs = [
        { id: "basic", label: "Basic Info" },
        { id: "categories", label: "Categories" },
        { id: "segments", label: "Segments" },
    ];

    return (
        <div className="max-w-4xl mx-auto min-h-[100dvh] flex flex-col">
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

            <form
                onSubmit={(e) => e.preventDefault()}
                className="flex-1 flex flex-col"
            >
                <div className="flex-1">
                    {activeTab === "basic" && (
                        <EventBasicInfo
                            basicInfo={basicInfo}
                            bannerFile={bannerFile}
                            bannerUrl={bannerUrl}
                            onBasicInfoChange={handleBasicInfoChange}
                            onBannerChange={handleBannerChange}
                            errors={basicInfoErrors}
                        />
                    )}

                    {activeTab === "categories" && (
                        <EventCategories
                            selectedCategories={selectedCategories}
                            availableCategories={availableCategories}
                            loadingCategories={loadingCategories}
                            onAddCategorySelector={addCategorySelector}
                            onRemoveCategorySelection={removeCategorySelection}
                            onUpdateCategorySelection={updateCategorySelection}
                        />
                    )}

                    {activeTab === "segments" && (
                        <EventSegments
                            segments={segments}
                            availableCategories={availableCategories}
                            onAddSegment={addSegment}
                            onRemoveSegment={removeSegment}
                            onUpdateSegment={updateSegment}
                            errors={segmentErrors}
                        />
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-8 pt-8 border-t border-stroke-weak">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-6 py-2 rounded-lg bg-zinc-800 text-text-weak font-medium"
                        disabled={loading}
                    >
                        Reset
                    </button>

                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={handleSaveDraft}
                            disabled={loading}
                            className="px-6 py-2 rounded-lg bg-zinc-800 text-text-weak font-medium"
                        >
                            {loading ? "Saving..." : "Save Draft"}
                        </button>
                        <button
                            type="button"
                            onClick={handlePublish}
                            disabled={loading}
                            className="px-6 py-2 rounded-lg bg-accent text-black font-medium"
                        >
                            {loading ? "Publishing..." : "Publish"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
