// client/src/pages/organizer/EventCreate.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import EventBasicInfo from "./EventBasicInfo";
import EventCategories from "./EventCategories";
import EventSegments from "./EventSegments";
import EventConstraints from "./EventConstraints";
import { cn } from "../../utils/helpers";
import EventDetailsView from "../EventDetailsView";

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
    registrationFee?: number;
}

export default function EventCreate() {
    const [activeTab, setActiveTab] = useState("basic");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const importUrl = searchParams.get("import_url");
    const [activeImportUrl, setActiveImportUrl] = useState<string | null>(importUrl);

    // If importUrl changes (e.g. navigation), update activeImportUrl
    // But only if we haven't processed it yet? 
    // Actually, simpler: just initialize state. If we navigate away and back, it resets.
    // That's fine. The issue is switching tabs *within* the component.
    // So useState(importUrl) is correct for initialization.
    // But we need to clear it after import.

    // Form state for basic info
    const [basicInfo, setBasicInfo] = useState({
        title: "",
        description: "",
        address: "",
        city: "",
        country: "Bangladesh",
        startDate: "",
        endDate: "",
        latitude: undefined as number | undefined,
        longitude: undefined as number | undefined,
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

    // Form state for constraints
    const [constraints, setConstraints] = useState<any[]>([]);

    // New States for Refactor
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const [isOnline, setIsOnline] = useState(false);
    const [hasMultipleSegments, setHasMultipleSegments] = useState(true);
    const [singleSegmentData, setSingleSegmentData] = useState({
        capacity: 0,
        registrationDeadline: "",
        isTeamSegment: false,
        minTeamSize: 1,
        maxTeamSize: 5,
    });

    // Fetch existing event data if in edit mode
    useEffect(() => {
        if (!id) return;

        const fetchEvent = async () => {
             try {
                const response = await fetch(`http://localhost:5050/api/events/${id}`, {
                    credentials: "include"
                });
                const data = await response.json();
                
                if (response.ok && data.event) {
                    const e = data.event;
                    setBasicInfo({
                        title: e.title,
                        description: e.description,
                        address: e.address,
                        city: e.city,
                        country: e.country,
                        startDate: e.startDate ? e.startDate.split("T")[0] : "",
                        endDate: e.endDate ? e.endDate.split("T")[0] : "",
                        latitude: e.latitude,
                        longitude: e.longitude,
                    });
                    setBannerUrl(e.bannerUrl ? `http://localhost:5050${e.bannerUrl}` : null);
                    setIsOnline(e.isOnline);
                    setHasMultipleSegments(e.hasMultipleSegments);
                    
                    if (e.eventCategories) {
                        setSelectedCategories(e.eventCategories.map((ec: any) => ec.categoryName));
                    }

                    if (e.segments && e.segments.length > 0) {
                        if (!e.hasMultipleSegments) {
                            // Load single segment data
                            const seg = e.segments[0];
                            setSingleSegmentData({
                                capacity: seg.capacity,
                                registrationDeadline: seg.registrationDeadline ? seg.registrationDeadline.split("T")[0] : "",
                                isTeamSegment: seg.isTeamSegment,
                                minTeamSize: seg.minTeamSize || 1,
                                maxTeamSize: seg.maxTeamSize || 5,
                            });
                        } else {
                            // Load multi segments
                             setSegments(e.segments.map((seg: any) => ({
                                ...seg,
                                startTime: seg.startTime ? seg.startTime.split("T")[0] : "", // Simplification for date input
                                endTime: seg.endTime ? seg.endTime.split("T")[0] : "",
                                registrationDeadline: seg.registrationDeadline ? seg.registrationDeadline.split("T")[0] : ""
                             })));
                        }
                    }

                    if (e.constraints) {
                        setConstraints(e.constraints);
                    }
                }
             } catch (err) {
                 console.error("Failed to fetch event", err);
                 setError("Failed to load event data");
             }
        };
        fetchEvent();
    }, [id]);

    // Validation errors
    const [basicInfoErrors, setBasicInfoErrors] = useState<
        Record<string, string>
    >({});
    const [segmentErrors, setSegmentErrors] = useState<
        Record<number, Record<string, string>>
    >({});

    // Add this function to handle import completion
    const handleImportComplete = (data: any) => {
        // Clear the auto-import URL so it doesn't trigger again on tab switch
        setActiveImportUrl(null);

        // Update basic info with imported data
        setBasicInfo((prev) => ({
            ...prev,
            title: data.title || prev.title,
            description: data.description || prev.description,
            address: data.address || prev.address,
            city: data.city || prev.city,
            country: data.country || prev.country,
            startDate: data.startDate || prev.startDate,
            endDate: data.endDate || prev.endDate,
        }));

        if (typeof data.isOnline === 'boolean') {
            setIsOnline(data.isOnline);
        }

        if (typeof data.hasMultipleSegments === 'boolean') {
            setHasMultipleSegments(data.hasMultipleSegments);
        }

        // Handle Segments
        if (data.segments && Array.isArray(data.segments) && data.segments.length > 0) {
            if (data.hasMultipleSegments) {
                // Map imported segments to state structure
                const mappedSegments = data.segments.map((seg: any) => ({
                    id: Date.now() + Math.random(), // Temp unique ID
                    name: seg.name || "Session",
                    description: seg.description || "",
                    // Convert ISO datetime to datetime-local format (YYYY-MM-DDTHH:mm)
                    startTime: seg.startTime ? seg.startTime.slice(0, 16) : "",
                    endTime: seg.endTime ? seg.endTime.slice(0, 16) : "",
                    categoryId: seg.category || "", // Map category from LLM
                    isTeamSegment: false,
                    isOnline: seg.isOnline || false,
                    registrationDeadline: ""
                }));
                setSegments(mappedSegments);
            }
        }

        // If banner URL is provided, try to fetch it
        if (data.bannerUrl) {
            fetch(data.bannerUrl)
                .then((response) => response.blob())
                .then((blob) => {
                    const file = new File([blob], "facebook-event-banner.jpg", {
                        type: blob.type,
                    });
                    setBannerFile(file);
                    setBannerUrl(URL.createObjectURL(file));
                })
                .catch((err) => console.error("Error fetching banner:", err));
        }

        // Set categories (replace, don't append)
        if (data.categoryNames && Array.isArray(data.categoryNames)) {
            setSelectedCategories(data.categoryNames);
        } else if (data.categories && Array.isArray(data.categories)) {
            setSelectedCategories(data.categories);
        }
    };

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
        if (!isOnline && !basicInfo.address.trim()) errors.address = "Address is required";
        if (!isOnline && !basicInfo.city.trim()) errors.city = "City is required";
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

            // Check segment start is not before event start
            if (segment.startTime && basicInfo.startDate) {
                const segmentStart = new Date(segment.startTime);
                const eventStart = new Date(basicInfo.startDate);
                if (segmentStart < eventStart) {
                    segmentErrors.startTime = "Segment start cannot be before event start date";
                }
            }

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

    const handleBasicInfoChange = (name: string, value: any) => {
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
    
    // Handler for single segment data
    const handleSingleSegmentChange = (field: string, value: any) => {
        setSingleSegmentData(prev => ({ ...prev, [field]: value }));
    }

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
            latitude: undefined,
            longitude: undefined,
        });
        setBannerFile(null);
        setBannerUrl(null);
        setSelectedCategories([]);
        setSegments([]);
        setConstraints([]);
        setSingleSegmentData({
            capacity: 0,
            registrationDeadline: "",
            isTeamSegment: false,
            minTeamSize: 1,
            maxTeamSize: 5,
        });
        setIsOnline(false);
        setHasMultipleSegments(true);
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

        // Check if at least one segment exists (only for multi-segment)
        if (hasMultipleSegments && segments.length === 0) {
            setActiveTab("segments");
            setError("At least one segment is required for multi-segment events");
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
            formData.append("isOnline", String(isOnline));
            formData.append("hasMultipleSegments", String(hasMultipleSegments));
            
            if (basicInfo.latitude) formData.append("latitude", String(basicInfo.latitude));
            if (basicInfo.longitude) formData.append("longitude", String(basicInfo.longitude));

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

            // Add constraints as JSON string
            if (constraints.length > 0) {
                formData.append("constraints", JSON.stringify(constraints));
            }

            // Add segments as JSON string
            if (hasMultipleSegments) {
                if (segments.length > 0) {
                    formData.append("segments", JSON.stringify(segments));
                }
            } else {
                // Construct single segment
                 const singleSegment = {
                    name: "Main Event",
                    description: "Main Event Segment",
                    startTime: basicInfo.startDate,
                    endTime: basicInfo.endDate || basicInfo.startDate,
                    capacity: singleSegmentData.capacity,
                    categoryId: null, // Can assign a default category if needed
                    isTeamSegment: singleSegmentData.isTeamSegment,
                    isOnline: isOnline,
                    registrationDeadline: singleSegmentData.registrationDeadline || null,
                    minTeamSize: singleSegmentData.minTeamSize,
                    maxTeamSize: singleSegmentData.maxTeamSize,
                    registrationFee: (singleSegmentData as any).registrationFee || 0
                 };
                 formData.append("segments", JSON.stringify([singleSegment]));
            }

            const url = isEditMode 
                ? `http://localhost:5050/api/events/${id}` 
                : "http://localhost:5050/api/events/create";
            
            const method = isEditMode ? "PUT" : "POST";

            const response = await fetch(
                url,
                {
                    method: method,
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
        ...(hasMultipleSegments ? [{ id: "segments", label: "Segments" }] : []),
        { id: "constraints", label: "Constraints" },
        { id: "preview", label: "Preview" },
    ];

    // Construct preview event object
    const getPreviewEvent = () => {
        const previewSegments = hasMultipleSegments 
            ? segments.map(s => ({
                id: s.id,
                name: s.name,
                description: s.description,
                startTime: s.startTime,
                endTime: s.endTime,
                isTeamSegment: s.isTeamSegment,
                registrationFee: (s as any).registrationFee // Placeholder as it's not in form state yet? Or maybe I missed it.
            })) 
            : [{
                id: "single",
                name: "Main Event",
                description: basicInfo.description,
                startTime: basicInfo.startDate,
                endTime: basicInfo.endDate,
                isTeamSegment: singleSegmentData.isTeamSegment,
                registrationFee: 0
            }];

        return {
            id: "preview",
            title: basicInfo.title || "Untitled Event",
            description: basicInfo.description || "No description provided.",
            bannerUrl: bannerUrl,
            startDate: basicInfo.startDate || new Date().toISOString(),
            endDate: basicInfo.endDate || "",
            address: basicInfo.address || "TBD",
            city: basicInfo.city || "TBD",
            location: basicInfo.address, // mapping
            isOnline: isOnline,
            segments: previewSegments,
            organizer: {
                name: "You (Organizer)"
            }
        };
    };

    return (
        <div className="max-w-4xl mx-auto min-h-[100dvh] flex flex-col">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-text-strong">
                    {isEditMode ? "Edit Event" : "Create New Event"}
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

            {activeTab === "preview" ? (
                // Render Preview
                <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
                    <div className="bg-zinc-900 p-4 border-b border-zinc-800 flex justify-between items-center">
                        <span className="text-yellow-500 font-bold">Preview Mode</span>
                        <button 
                            onClick={() => setActiveTab("basic")}
                            className="text-sm text-accent hover:underline"
                        >
                            Back to Edit
                        </button>
                    </div>
                    {/* We need to import EventDetailsView dynamically or at top */}
                    {/* Since this file is tsx, we can assume it's imported at top. I will add import in next step. */}
                    {/* For now assuming the import exists */}
                    {/* Just mounting logic here */}
                    <div className="transform scale-[0.9] origin-top h-full overflow-y-auto">
                         <EventDetailsView 
                            event={getPreviewEvent() as any} 
                            isPreview={true} 
                        />
                    </div>
                </div>
            ) : (
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
                                onImportComplete={(data) => {
                                    handleImportComplete(data);
                                    // Clear the import param so it doesn't trigger again
                                    // We can just rely on internal state of EventBasicInfo/FacebookImport if we pass a flag
                                    // actually cleaner to just clear it from the prop we pass
                                    // but we can't mutate the prop directly
                                    // So we'll use a local state initialized from the param
                                }}
                                errors={basicInfoErrors}
                                isOnline={isOnline}
                                onIsOnlineChange={setIsOnline}
                                hasMultipleSegments={hasMultipleSegments}
                                onHasMultipleSegmentsChange={setHasMultipleSegments}
                                singleSegmentData={singleSegmentData}
                                onSingleSegmentChange={handleSingleSegmentChange}
                                initialScrapeUrl={activeImportUrl}
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

                        {activeTab === "constraints" && (
                            <EventConstraints
                                constraints={constraints}
                                hasMultipleSegments={hasMultipleSegments}
                                segments={segments}
                                onAddConstraint={(c) => setConstraints((prev) => [...prev, c])}
                                onRemoveConstraint={(id) => setConstraints((prev) => prev.filter(c => c.id !== id))}
                                onUpdateConstraint={(id, updated) => setConstraints((prev) => prev.map(c => c.id === id ? updated : c))}
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
            )}
        </div>
    );
}
