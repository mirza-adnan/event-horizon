// client/src/components/EventManagement/EventEdit.tsx
import { useState, useEffect } from "react";
import EventBasicInfo from "../OrgDashboard/EventBasicInfo";
import EventCategories from "../OrgDashboard/EventCategories";
import EventSegments from "../OrgDashboard/EventSegments";
import EventConstraints from "../OrgDashboard/EventConstraints";
import { cn } from "../../utils/helpers";
import { FaSave, FaSpinner } from "react-icons/fa";

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
    registrationFee: number;
}

interface EventEditProps {
    eventId: string;
    onUpdateSuccess?: () => void;
}

export default function EventEdit({ eventId, onUpdateSuccess }: EventEditProps) {
    const [activeTab, setActiveTab] = useState("basic");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
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
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerUrl, setBannerUrl] = useState<string | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [constraints, setConstraints] = useState<any[]>([]);
    const [isOnline, setIsOnline] = useState(false);
    const [hasMultipleSegments, setHasMultipleSegments] = useState(true);
    const [singleSegmentData, setSingleSegmentData] = useState({
        capacity: 0,
        registrationDeadline: "",
        isTeamSegment: false,
        minTeamSize: 1,
        maxTeamSize: 5,
        registrationFee: 0,
    });

    const [basicInfoErrors, setBasicInfoErrors] = useState<Record<string, string>>({});
    const [segmentErrors] = useState<Record<number, Record<string, string>>>({});

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch Categories
                const catRes = await fetch("http://localhost:5050/api/categories");
                if (catRes.ok) {
                    const catData = await catRes.json();
                    setAvailableCategories(catData.categories || []);
                }
                setLoadingCategories(false);

                // Fetch Event
                const eventRes = await fetch(`http://localhost:5050/api/events/${eventId}`);
                const data = await eventRes.json();
                
                if (eventRes.ok && data.event) {
                    const e = data.event;
                    setBasicInfo({
                        title: e.title,
                        description: e.description,
                        address: e.address,
                        city: e.city,
                        country: e.country,
                        startDate: e.startDate ? e.startDate.substring(0, 10) : "",
                        endDate: e.endDate ? e.endDate.substring(0, 10) : "",
                        latitude: e.latitude,
                        longitude: e.longitude,
                    });
                    setBannerUrl(e.bannerUrl ? `http://localhost:5050${e.bannerUrl}` : null);
                    setIsOnline(e.isOnline);
                    setHasMultipleSegments(e.hasMultipleSegments);
                    
                    if (e.eventCategories) {
                        setSelectedCategories(e.eventCategories.map((ec: any) => ec.categoryName || ""));
                    }

                    if (e.segments && e.segments.length > 0) {
                        if (!e.hasMultipleSegments) {
                            const seg = e.segments[0];
                            setSingleSegmentData({
                                capacity: seg.capacity,
                                registrationDeadline: seg.registrationDeadline ? seg.registrationDeadline.substring(0, 10) : "",
                                isTeamSegment: seg.isTeamSegment,
                                minTeamSize: seg.minTeamSize || 1,
                                maxTeamSize: seg.maxTeamSize || 5,
                                registrationFee: seg.registrationFee || 0
                            });
                        } else {
                             setSegments(e.segments.map((seg: any) => ({
                                ...seg,
                                startTime: seg.startTime ? seg.startTime.substring(0, 16) : "",
                                endTime: seg.endTime ? seg.endTime.substring(0, 16) : "",
                                registrationDeadline: seg.registrationDeadline ? seg.registrationDeadline.substring(0, 16) : "",
                                registrationFee: seg.registrationFee || 0
                             })));
                        }
                    }

                    if (e.constraints) {
                        setConstraints(e.constraints);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch event data", err);
                setError("Failed to load event data");
            } finally {
                setFetching(false);
            }
        };

        fetchInitialData();
    }, [eventId]);

    const handleBasicInfoChange = (name: string, value: any) => {
        setBasicInfo((prev) => ({ ...prev, [name]: value }));
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
    };

    const handleSingleSegmentChange = (field: string, value: any) => {
        setSingleSegmentData((prev) => ({ ...prev, [field]: value }));
    };

    const addCategorySelector = () => {
        setSelectedCategories((prev) => [...prev, ""]);
    };

    const removeCategorySelection = (index: number) => {
        setSelectedCategories((prev) => prev.filter((_, i) => i !== index));
    };

    const updateCategorySelection = (index: number, value: string) => {
        setSelectedCategories((prev) =>
            prev.map((cat, i) => (i === index ? value : cat))
        );
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
                categoryId: "",
                isTeamSegment: false,
                isOnline: false,
                registrationDeadline: "",
                registrationFee: 0,
            },
        ]);
    };

    const removeSegment = (id: number) => {
        setSegments((prev) => prev.filter((s) => s.id !== id));
    };

    const updateSegment = (id: number, field: keyof Segment, value: any) => {
        setSegments((prev) =>
            prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
        );
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const formData = new FormData();
            formData.append("title", basicInfo.title);
            formData.append("description", basicInfo.description);
            formData.append("address", basicInfo.address);
            formData.append("city", basicInfo.city);
            formData.append("country", basicInfo.country);
            formData.append("startDate", basicInfo.startDate);
            if (basicInfo.endDate) formData.append("endDate", basicInfo.endDate);
            formData.append("isOnline", String(isOnline));
            formData.append("hasMultipleSegments", String(hasMultipleSegments));
            
            if (basicInfo.latitude) formData.append("latitude", String(basicInfo.latitude));
            if (basicInfo.longitude) formData.append("longitude", String(basicInfo.longitude));

            if (bannerFile) formData.append("banner", bannerFile);

            selectedCategories
                .filter((cat) => cat && typeof cat === 'string' && cat.trim() !== "")
                .forEach((category) => formData.append("categoryNames", category));

            if (constraints.length > 0) {
                formData.append("constraints", JSON.stringify(constraints));
            }

            if (hasMultipleSegments) {
                formData.append("segments", JSON.stringify(segments));
            } else {
                 const singleSegment = {
                    name: "Main Event",
                    description: "Main Event Segment",
                    startTime: basicInfo.startDate,
                    endTime: basicInfo.endDate || basicInfo.startDate,
                    capacity: singleSegmentData.capacity,
                    isTeamSegment: singleSegmentData.isTeamSegment,
                    isOnline: isOnline,
                    registrationDeadline: singleSegmentData.registrationDeadline || null,
                    minTeamSize: singleSegmentData.minTeamSize,
                    maxTeamSize: singleSegmentData.maxTeamSize,
                    registrationFee: singleSegmentData.registrationFee || 0
                 };
                 formData.append("segments", JSON.stringify([singleSegment]));
            }

            const res = await fetch(`http://localhost:5050/api/events/${eventId}`, {
                method: "PUT",
                body: formData,
                credentials: "include",
            });

            if (res.ok) {
                setSuccess("Event updated successfully!");
                if (onUpdateSuccess) onUpdateSuccess();
            } else {
                const data = await res.json();
                setError(data.message || "Failed to update event");
            }
        } catch (err) {
            console.error("Update error:", err);
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-accent text-2xl" /></div>;

    const tabs = [
        { id: "basic", label: "Basic Info" },
        { id: "categories", label: "Categories" },
        ...(hasMultipleSegments ? [{ id: "segments", label: "Segments" }] : []),
        { id: "constraints", label: "Constraints" },
    ];

    return (
        <div className="bg-zinc-950 min-h-full">
            <div className="flex justify-between items-center mb-6">
                <nav className="flex space-x-6 border-b border-zinc-800 flex-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "py-3 px-1 border-b-2 font-medium text-sm transition-colors",
                                activeTab === tab.id
                                    ? "border-accent text-accent"
                                    : "border-transparent text-zinc-500 hover:text-white"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="ml-6 px-6 py-2 bg-accent text-black rounded-lg font-bold flex items-center gap-2 hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                    {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    Save Changes
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                    {success}
                </div>
            )}

            <div className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800">
                {activeTab === "basic" && (
                    <EventBasicInfo
                        basicInfo={basicInfo}
                        bannerFile={bannerFile}
                        bannerUrl={bannerUrl}
                        onBasicInfoChange={handleBasicInfoChange}
                        onBannerChange={handleBannerChange}
                        onImportComplete={() => {}}
                        errors={basicInfoErrors}
                        isOnline={isOnline}
                        onIsOnlineChange={setIsOnline}
                        hasMultipleSegments={hasMultipleSegments}
                        onHasMultipleSegmentsChange={setHasMultipleSegments}
                        singleSegmentData={singleSegmentData}
                        onSingleSegmentChange={handleSingleSegmentChange}
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
        </div>
    );
}
