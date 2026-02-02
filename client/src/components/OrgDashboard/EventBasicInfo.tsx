import ImageUpload from "../ImageUpload";
import FacebookEventImport from "./FacebookEventImport";
import MapPicker from "../MapPicker";
import VenueSearch from "./VenueSearch";

interface EventBasicInfoProps {
    basicInfo: {
        title: string;
        description: string;
        address: string;
        city: string;
        country: string;
        startDate: string;
        endDate: string;
        latitude?: number;
        longitude?: number;
    };
    bannerFile: File | null;
    bannerUrl: string | null;
    onBasicInfoChange: (name: string, value: any) => void;
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

    const handleVenueSelect = (venue: any) => {
        onBasicInfoChange("address", venue.name);
        if (venue.city) onBasicInfoChange("city", venue.city);
        onBasicInfoChange("latitude", venue.lat);
        onBasicInfoChange("longitude", venue.lng);
    };

    const handleOnlineToggle = (checked: boolean) => {
        onIsOnlineChange(checked);
        if (checked) {
            onBasicInfoChange("address", "Online");
            onBasicInfoChange("city", "");
            onBasicInfoChange("latitude", undefined);
            onBasicInfoChange("longitude", undefined);
        } else if (basicInfo.address === "Online") {
            onBasicInfoChange("address", "");
        }
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
                        onChange={(e) => handleOnlineToggle(e.target.checked)}
                        className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-accent focus:ring-accent"
                    />
                    <label htmlFor="isOnline" className="text-text-strong select-none cursor-pointer">
                        Online
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

            {!isOnline && (
                <div className="space-y-4 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl relative">
                    <div className="flex flex-col gap-1">
                        <label className="block text-xs font-bold text-accent uppercase tracking-widest">
                            Venue Location
                        </label>
                        <p className="text-[10px] text-zinc-500 italic">
                            Search for your venue or manually click on the map to set the location
                        </p>
                    </div>
                    
                    <div className="relative z-[1001]">
                        <VenueSearch onSelect={handleVenueSelect} />
                    </div>

                    <div className="h-[300px] rounded-xl overflow-hidden border border-zinc-800 z-10">
                        <MapPicker 
                            lat={basicInfo.latitude} 
                            lng={basicInfo.longitude} 
                            onChange={(lat, lng) => {
                                onBasicInfoChange("latitude", lat);
                                onBasicInfoChange("longitude", lng);
                            }} 
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block ml-1">Address {isOnline ? "" : "*"}</label>
                    <input
                        type="text"
                        value={basicInfo.address}
                        onChange={(e) =>
                            onBasicInfoChange("address", e.target.value)
                        }
                        disabled={isOnline}
                        className={`w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ${
                            errors.address && !isOnline
                                ? "ring-red-500"
                                : "ring-[#373737] focus:ring-accent"
                        } ${isOnline ? "opacity-50 cursor-not-allowed" : ""}`}
                        required={!isOnline}
                    />
                    {errors.address && !isOnline && (
                        <p className="text-red-400 text-sm">{errors.address}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="block ml-1">City {isOnline ? "" : "*"}</label>
                    <input
                        type="text"
                        value={basicInfo.city}
                        onChange={(e) =>
                            onBasicInfoChange("city", e.target.value)
                        }
                        disabled={isOnline}
                        className={`w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ${
                            errors.city && !isOnline
                                ? "ring-red-500"
                                : "ring-[#373737] focus:ring-accent"
                        } ${isOnline ? "opacity-50 cursor-not-allowed" : ""}`}
                        required={!isOnline}
                    />
                    {errors.city && !isOnline && (
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
                            <label className="block ml-1">Registration Deadline</label>
                            <input
                                type="date"
                                value={singleSegmentData.registrationDeadline}
                                onChange={(e) => onSingleSegmentChange("registrationDeadline", e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block ml-1">Registration Fee (BDT)</label>
                            <input
                                type="number"
                                min="0"
                                value={singleSegmentData.registrationFee || 0}
                                onChange={(e) => onSingleSegmentChange("registrationFee", parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent"
                            />
                            <p className="text-[10px] text-zinc-500 ml-1">Set to 0 for free events</p>
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
