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
}

export default function EventBasicInfo({
    basicInfo,
    bannerFile,
    bannerUrl,
    onBasicInfoChange,
    onBannerChange,
}: EventBasicInfoProps) {
    return (
        <div className="space-y-6">
            <Input
                label="Event Title"
                name="title"
                value={basicInfo.title}
                onChange={(e) => onBasicInfoChange("title", e.target.value)}
                required
            />

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
                <Input
                    label="Address"
                    name="address"
                    value={basicInfo.address}
                    onChange={(e) =>
                        onBasicInfoChange("address", e.target.value)
                    }
                    required
                />

                <Input
                    label="City"
                    name="city"
                    value={basicInfo.city}
                    onChange={(e) => onBasicInfoChange("city", e.target.value)}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Country"
                    name="country"
                    value={basicInfo.country}
                    onChange={(e) =>
                        onBasicInfoChange("country", e.target.value)
                    }
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block ml-1">Start Date</label>
                    <input
                        type="date"
                        value={basicInfo.startDate}
                        onChange={(e) =>
                            onBasicInfoChange("startDate", e.target.value)
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
                            onBasicInfoChange("endDate", e.target.value)
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
                        onBasicInfoChange("description", e.target.value)
                    }
                    className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent min-h-[100px]"
                    required
                />
            </div>
        </div>
    );
}
