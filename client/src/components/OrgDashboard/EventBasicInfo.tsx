import ImageUpload from "../ImageUpload";
import FacebookEventImport from "./FacebookEventImport";

interface EventBasicInfoProps {
    basicInfo: {
        title: string;
        description: string;
        address: string;
        city: string;
        country: string;
        startDate: string;
        endDate: string;
    };
    bannerFile: File | null;
    bannerUrl: string | null;
    onBasicInfoChange: (name: string, value: string) => void;
    onBannerChange: (file: File | null) => void;
    onImportComplete: (data: any) => void;
    errors: Record<string, string>;
    isOnline: boolean;
    onIsOnlineChange: (value: boolean) => void;
    hasMultipleSegments: boolean;
    onHasMultipleSegmentsChange: (value: boolean) => void;
    singleSegmentData: any;
    onSingleSegmentChange: (field: string, value: any) => void;
}

export default function EventBasicInfo({
    basicInfo,
    bannerFile,
    bannerUrl,
    onBasicInfoChange,
    onBannerChange,
    onImportComplete,
    errors,
    isOnline,
    onIsOnlineChange,
    hasMultipleSegments,
    onHasMultipleSegmentsChange,
    singleSegmentData,
    onSingleSegmentChange,
}: EventBasicInfoProps) {
    const handleImportComplete = (data: any) => {
        onImportComplete(data);
        if (data.isOnline !== undefined) onIsOnlineChange(data.isOnline);
    };

    return (
        <div className="space-y-6">
            <FacebookEventImport onScrapeComplete={handleImportComplete} />

            {/* Event Structure Toggles */}
            <div className="flex flex-col gap-4 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                <div className="flex items-center justify-between">
                     <label className="text-text-strong font-medium">Event Type</label>
                     <div className="flex bg-zinc-800 rounded-lg p-1">
                        <button
                            type="button"
                            onClick={() => onHasMultipleSegmentsChange(false)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                !hasMultipleSegments ? "bg-accent text-black" : "text-text-weak hover:text-white"
                            }`}
                        >
                            Single Segment
                        </button>
                        <button
                            type="button"
                            onClick={() => onHasMultipleSegmentsChange(true)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                hasMultipleSegments ? "bg-accent text-black" : "text-text-weak hover:text-white"
                            }`}
                        >
                            Multi-Segment
                        </button>
                     </div>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="isOnline"
                        checked={isOnline}
                        onChange={(e) => onIsOnlineChange(e.target.checked)}
                        className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-accent focus:ring-accent"
                    />
                    <label htmlFor="isOnline" className="text-text-strong select-none cursor-pointer">
                        This is an online event
                    </label>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block ml-1">Event Title *</label>
                <input
                    type="text"
                    value={basicInfo.title}
                    onChange={(e) => onBasicInfoChange("title", e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ${
                        errors.title
                            ? "ring-red-500"
                            : "ring-[#373737] focus:ring-accent"
                    }`}
                    required
                />
                {errors.title && (
                    <p className="text-red-400 text-sm">{errors.title}</p>
                )}
            </div>

            {/* Banner Upload */}
            <div>
                <ImageUpload
                    label="Event Banner"
                    onFileChange={onBannerChange}
                    previewUrl={bannerUrl || undefined}
                    accept="image/*"
                    maxSize={10}
                    name="event-banner"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block ml-1">Address *</label>
                    <input
                        type="text"
                        value={basicInfo.address}
                        onChange={(e) =>
                            onBasicInfoChange("address", e.target.value)
                        }
                        className={`w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ${
                            errors.address
                                ? "ring-red-500"
                                : "ring-[#373737] focus:ring-accent"
                        }`}
                        required
                    />
                    {errors.address && (
                        <p className="text-red-400 text-sm">{errors.address}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="block ml-1">City *</label>
                    <input
                        type="text"
                        value={basicInfo.city}
                        onChange={(e) =>
                            onBasicInfoChange("city", e.target.value)
                        }
                        className={`w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ${
                            errors.city
                                ? "ring-red-500"
                                : "ring-[#373737] focus:ring-accent"
                        }`}
                        required
                    />
                    {errors.city && (
                        <p className="text-red-400 text-sm">{errors.city}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block ml-1">Country</label>
                    <input
                        type="text"
                        value={basicInfo.country}
                        readOnly
                        className="w-full px-4 py-2 rounded-lg bg-zinc-900 text-zinc-500 border-none outline-none ring-1 ring-[#373737] cursor-not-allowed"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block ml-1">Start Date *</label>
                    <input
                        type="date"
                        value={basicInfo.startDate}
                        onChange={(e) =>
                            onBasicInfoChange("startDate", e.target.value)
                        }
                        className={`w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ${
                            errors.startDate
                                ? "ring-red-500"
                                : "ring-[#373737] focus:ring-accent"
                        }`}
                        required
                    />
                    {errors.startDate && (
                        <p className="text-red-400 text-sm">
                            {errors.startDate}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="block ml-1">End Date</label>
                    <input
                        type="date"
                        value={basicInfo.endDate}
                        onChange={(e) =>
                            onBasicInfoChange("endDate", e.target.value)
                        }
                        className={`w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ${
                            errors.endDate
                                ? "ring-red-500"
                                : "ring-[#373737] focus:ring-accent"
                        }`}
                    />
                    {errors.endDate && (
                        <p className="text-red-400 text-sm">{errors.endDate}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label className="block ml-1">Description *</label>
                <textarea
                    value={basicInfo.description}
                    onChange={(e) =>
                        onBasicInfoChange("description", e.target.value)
                    }
                    className={`w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ${
                        errors.description
                            ? "ring-red-500"
                            : "ring-[#373737] focus:ring-accent"
                    } min-h-[100px]`}
                    required
                />
                {errors.description && (
                    <p className="text-red-400 text-sm">{errors.description}</p>
                )}
            </div>

            {/* Single Segment Extra Fields */}
            {!hasMultipleSegments && (
                <div className="space-y-6 pt-6 border-t border-zinc-800 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-semibold text-text-strong">Registration Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block ml-1">Registration Capacity *</label>
                            <input
                                type="number"
                                min="0"
                                value={singleSegmentData.capacity}
                                onChange={(e) => onSingleSegmentChange("capacity", parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block ml-1">Registration Deadline</label>
                            <input
                                type="date"
                                value={singleSegmentData.registrationDeadline}
                                onChange={(e) => onSingleSegmentChange("registrationDeadline", e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent"
                            />
                        </div>
                    </div>

                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                             <input
                                type="checkbox"
                                id="isTeamSegment"
                                checked={singleSegmentData.isTeamSegment}
                                onChange={(e) => onSingleSegmentChange("isTeamSegment", e.target.checked)}
                                className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-accent focus:ring-accent"
                            />
                            <label htmlFor="isTeamSegment" className="text-text-strong select-none cursor-pointer">
                                Team Participation Required
                            </label>
                        </div>
                        
                        {singleSegmentData.isTeamSegment && (
                            <div className="grid grid-cols-2 gap-6 pl-8">
                                <div className="space-y-2">
                                    <label className="block ml-1">Min Team Size</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={singleSegmentData.minTeamSize}
                                        onChange={(e) => onSingleSegmentChange("minTeamSize", parseInt(e.target.value) || 1)}
                                        className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block ml-1">Max Team Size</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={singleSegmentData.maxTeamSize}
                                        onChange={(e) => onSingleSegmentChange("maxTeamSize", parseInt(e.target.value) || 1)}
                                        className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent"
                                    />
                                </div>
                            </div>
                        )}
                     </div>
                </div>
            )}
        </div>
    );
}
