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
    minTeamSize?: number;
    maxTeamSize?: number;
    registrationFee?: number;
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
    errors: Record<number, Record<string, string>>;
}

export default function EventSegments({
    segments,
    availableCategories,
    onAddSegment,
    onRemoveSegment,
    onUpdateSegment,
    errors,
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

            {segments.length === 0 ? (
                <div className="text-center py-8 border border-zinc-700 rounded-lg">
                    <p className="text-text-weak">
                        No segments added yet. Click "Add Segment" to get
                        started.
                    </p>
                </div>
            ) : (
                segments.map((segment) => (
                    <EventSegment
                        key={segment.id}
                        segment={segment}
                        index={
                            segments.findIndex((s) => s.id === segment.id) + 1
                        }
                        availableCategories={availableCategories}
                        onUpdateSegment={onUpdateSegment}
                        onRemoveSegment={onRemoveSegment}
                        isRemovable={true}
                        errors={errors[segment.id] || {}}
                    />
                ))
            )}
        </div>
    );
}
