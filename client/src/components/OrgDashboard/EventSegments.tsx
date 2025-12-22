// client/src/components/organizer/EventSegments.tsx
import { useState } from "react";
import EventSegment from "./EventSegment";

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
}

interface EventSegmentsProps {
    segments: Segment[];
    availableCategories: Category[];
    onAddSegment: () => void;
    onRemoveSegment: (id: number) => void;
    onUpdateSegment: (
        id: number,
        field: keyof Segment,
        value: string | number | boolean
    ) => void;
}

export default function EventSegments({
    segments,
    availableCategories,
    onAddSegment,
    onRemoveSegment,
    onUpdateSegment,
}: EventSegmentsProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Event Segments</h3>
                    <p className="text-sm text-text-weak">
                        Create individual segments for your event (e.g., Quiz,
                        Hackathon, Workshop)
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onAddSegment}
                    className="px-4 py-2 bg-accent text-black rounded-lg font-medium"
                >
                    Add Segment
                </button>
            </div>

            {segments.map((segment, index) => (
                <EventSegment
                    key={segment.id}
                    segment={segment}
                    index={index}
                    availableCategories={availableCategories}
                    onUpdateSegment={onUpdateSegment}
                    onRemoveSegment={onRemoveSegment}
                    isRemovable={segments.length > 1}
                />
            ))}
        </div>
    );
}
