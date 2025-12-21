// client/src/pages/organizer/EventsList.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../utils/helpers";

// Mock data for events
const mockEvents = [
    {
        id: "1",
        title: "Tech Conference 2024",
        description:
            "Annual technology conference featuring the latest innovations",
        location: "Dhaka, Bangladesh",
        startDate: "2024-12-15",
        endDate: "2024-12-17",
        status: "published" as const,
        isOnline: false,
    },
    {
        id: "2",
        title: "Business Summit",
        description: "Gathering of business leaders and entrepreneurs",
        location: "Chittagong, Bangladesh",
        startDate: "2024-11-20",
        endDate: "2024-11-21",
        status: "draft" as const,
        isOnline: true,
    },
    {
        id: "3",
        title: "Education Workshop",
        description: "Interactive workshop for educators",
        location: "Sylhet, Bangladesh",
        startDate: "2024-10-05",
        endDate: "2024-10-05",
        status: "completed" as const,
        isOnline: false,
    },
];

export default function EventsList() {
    const [events] = useState(mockEvents);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "published":
                return "bg-green-500";
            case "draft":
                return "bg-yellow-500";
            case "cancelled":
                return "bg-red-500";
            case "completed":
                return "bg-blue-500";
            default:
                return "bg-gray-500";
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text-strong">
                        Your Events
                    </h1>
                    <p className="text-text-weak">
                        Manage and track your events
                    </p>
                </div>
                <Link
                    to="/organizer/event/create"
                    className="px-6 py-2 bg-accent text-black rounded-lg font-medium"
                >
                    Create Event
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <div
                        key={event.id}
                        className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold text-text-strong">
                                    {event.title}
                                </h3>
                                <span
                                    className={cn(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                        getStatusColor(event.status)
                                    )}
                                >
                                    {event.status}
                                </span>
                            </div>

                            <p className="text-text-weak text-sm mb-4 line-clamp-2">
                                {event.description}
                            </p>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center text-text-weak">
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    {event.location}
                                </div>
                                <div className="flex items-center text-text-weak">
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    {new Date(
                                        event.startDate
                                    ).toLocaleDateString()}{" "}
                                    -{" "}
                                    {new Date(
                                        event.endDate
                                    ).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-text-weak">
                                    {event.isOnline ? (
                                        <>
                                            <svg
                                                className="w-4 h-4 mr-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
                                                />
                                            </svg>
                                            Online Event
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                className="w-4 h-4 mr-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                            In-person Event
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-zinc-800 border-t border-zinc-700">
                            <div className="flex justify-end space-x-3">
                                <button className="text-text-weak hover:text-text-strong text-sm">
                                    Edit
                                </button>
                                <button className="text-text-weak hover:text-text-strong text-sm">
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
