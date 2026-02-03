// client/src/components/organizer/EventSegment.tsx
import { useState } from "react";
import Input from "../Input";
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
    registrationFee?: number;
}

interface EventSegmentProps {
    segment: Segment;
    index: number;
    availableCategories: Category[];
    onUpdateSegment: (
        id: number,
        field: keyof Segment,
        value: string | number | boolean
    ) => void;
    onRemoveSegment: (id: number) => void;
    isRemovable: boolean;
    errors: Record<string, string>;
}

export default function EventSegment({
    segment,
    index,
    availableCategories,
    onUpdateSegment,
    onRemoveSegment,
    isRemovable,
    errors,
}: EventSegmentProps) {
    return (
        <div className="border border-zinc-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Segment {index}</h4>
                {isRemovable && (
                    <button
                        type="button"
                        onClick={() => onRemoveSegment(segment.id)}
                        className="text-red-500 hover:text-red-400"
                    >
                        Remove
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                        <label className="block">Segment Name *</label>
                        <input
                            type="text"
                            value={segment.name}
                            onChange={(e) =>
                                onUpdateSegment(
                                    segment.id,
                                    "name",
                                    e.target.value
                                )
                            }
                            placeholder="e.g., Tech Quiz, Hackathon, Workshop"
                            className={`w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ${
                                errors.name
                                    ? "ring-red-500"
                                    : "ring-[#373737] focus:ring-accent"
                            }`}
                            required
                        />
                        {errors.name && (
                            <p className="text-red-400 text-sm">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            checked={segment.isTeamSegment}
                            onChange={(e) =>
                                onUpdateSegment(
                                    segment.id,
                                    "isTeamSegment",
                                    e.target.checked
                                )
                            }
                            className="w-4 h-4 text-accent rounded focus:ring-accent"
                        />
                        <label className="text-text-weak">Team Segment</label>
                    </div>

                    {segment.isTeamSegment && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-2">
                                <label className="block">Min Team Size</label>
                                <input
                                    type="number"
                                    value={segment.minTeamSize || ""}
                                    onChange={(e) =>
                                        onUpdateSegment(
                                            segment.id,
                                            "minTeamSize",
                                            parseInt(e.target.value) || 0
                                        )
                                    }
                                    className={`w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ${
                                        errors.minTeamSize
                                            ? "ring-red-500"
                                            : "ring-[#373737] focus:ring-accent"
                                    }`}
                                    min="1"
                                    placeholder="Min team size"
                                />
                                {errors.minTeamSize && (
                                    <p className="text-red-400 text-sm">
                                        {errors.minTeamSize}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col space-y-2">
                                <label className="block">Max Team Size</label>
                                <input
                                    type="number"
                                    value={segment.maxTeamSize || ""}
                                    onChange={(e) =>
                                        onUpdateSegment(
                                            segment.id,
                                            "maxTeamSize",
                                            parseInt(e.target.value) || 0
                                        )
                                    }
                                    className={`w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ${
                                        errors.maxTeamSize
                                            ? "ring-red-500"
                                            : "ring-[#373737] focus:ring-accent"
                                    }`}
                                    min="1"
                                    placeholder="Max team size"
                                />
                                {errors.maxTeamSize && (
                                    <p className="text-red-400 text-sm">
                                        {errors.maxTeamSize}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col space-y-2">
                        <label className="block">Start Time</label>
                        <input
                            type="datetime-local"
                            value={segment.startTime}
                            onChange={(e) =>
                                onUpdateSegment(
                                    segment.id,
                                    "startTime",
                                    e.target.value
                                )
                            }
                            className={`w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ${
                                errors.startTime
                                    ? "ring-red-500"
                                    : "ring-[#373737] focus:ring-accent"
                            }`}
                            required
                        />
                        {errors.startTime && (
                            <p className="text-red-400 text-sm">
                                {errors.startTime}
                            </p>
                        )}
                    </div>



                    <div className="flex flex-col space-y-2">
                        <label className="block">Registration Deadline</label>
                        <input
                            type="datetime-local"
                            value={segment.registrationDeadline}
                            onChange={(e) =>
                                onUpdateSegment(
                                    segment.id,
                                    "registrationDeadline",
                                    e.target.value
                                )
                            }
                            className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                            <label className="block">Registration Fee (BDT)</label>
                            <input
                                type="number"
                                min="0"
                                value={segment.registrationFee || 0}
                                onChange={(e) =>
                                    onUpdateSegment(
                                        segment.id,
                                        "registrationFee",
                                        parseInt(e.target.value) || 0
                                    )
                                }
                                className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent"
                            />
                            <p className="text-[10px] text-zinc-500">Set to 0 for free events</p>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <label className="block">Category</label>
                        <select
                            value={segment.categoryId}
                            onChange={(e) =>
                                onUpdateSegment(
                                    segment.id,
                                    "categoryId",
                                    e.target.value
                                )
                            }
                            className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent"
                        >
                            <option value="">Select a category</option>
                            {availableCategories.map((category) => (
                                <option
                                    key={category.name}
                                    value={category.name}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            checked={segment.isOnline}
                            onChange={(e) =>
                                onUpdateSegment(
                                    segment.id,
                                    "isOnline",
                                    e.target.checked
                                )
                            }
                            className="w-4 h-4 text-accent rounded focus:ring-accent"
                        />
                        <label className="text-text-weak">Online Segment</label>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <label className="block">End Time</label>
                        <input
                            type="datetime-local"
                            value={segment.endTime}
                            onChange={(e) =>
                                onUpdateSegment(
                                    segment.id,
                                    "endTime",
                                    e.target.value
                                )
                            }
                            className={`w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ${
                                errors.endTime
                                    ? "ring-red-500"
                                    : "ring-[#373737] focus:ring-accent"
                            }`}
                        />
                        {errors.endTime && (
                            <p className="text-red-400 text-sm">
                                {errors.endTime}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <div className="flex flex-col space-y-2">
                    <label className="block">Description</label>
                    <textarea
                        value={segment.description}
                        onChange={(e) =>
                            onUpdateSegment(
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
        </div>
    );
}
