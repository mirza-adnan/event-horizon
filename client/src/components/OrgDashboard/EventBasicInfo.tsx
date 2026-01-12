// client/src/components/organizer/EventBasicInfo.tsx
import Input from "../Input";
import ImageUpload from "../ImageUpload";

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
    errors: Record<string, string>;
}

export default function EventBasicInfo({
    basicInfo,
    bannerFile,
    bannerUrl,
    onBasicInfoChange,
    onBannerChange,
    errors,
}: EventBasicInfoProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="block ml-1">
                    Event Title {"  "}
                    <span className="text-danger">*</span>
                </label>
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
                    <label className="block ml-1">
                        Address{"  "}
                        <span className="text-danger">*</span>
                    </label>
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
                    <label className="block ml-1">
                        City{"  "}
                        <span className="text-danger">*</span>
                    </label>
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
                        onChange={(e) =>
                            onBasicInfoChange("country", e.target.value)
                        }
                        className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent"
                        disabled={true}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block ml-1">
                        Start Date {"  "}
                        <span className="text-danger">*</span>
                    </label>
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
                <label className="block ml-1">
                    Description {"  "}
                    <span className="text-danger">*</span>
                </label>
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
        </div>
    );
}
