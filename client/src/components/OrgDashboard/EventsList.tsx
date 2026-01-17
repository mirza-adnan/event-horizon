// client/src/components/OrgDashboard/EventsList.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface Event {
    id: string;
    title: string;
    description: string;
    address: string;
    city: string;
    country: string;
    startDate: string;
    endDate: string | null;
    status: "draft" | "published" | "cancelled" | "completed";
    bannerUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function EventsList() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    console.log("Hello from events list");

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5050/api/events/my",
                    {
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch events");
                }

                const data = await response.json();
                setEvents(data.events);
            } catch (err) {
                setError("Failed to load events");
                console.error("Error fetching events:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-text-weak">Loading events...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-red-400">{error}</div>
            </div>
        );
    }

    // Group events by status
    const publishedEvents = events.filter(
        (event) => event.status === "published"
    );
    const draftEvents = events.filter((event) => event.status === "draft");
    const completedEvents = events.filter(
        (event) => event.status === "completed"
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-text-strong">
                    My Events
                </h1>
                <Link
                    to="/organizers/event/create"
                    className="px-4 py-2 bg-accent text-black rounded-lg font-medium"
                >
                    Create Event
                </Link>
            </div>

            {/* Published Events */}
            <div>
                <h2 className="text-xl font-semibold text-text-strong mb-4">
                    Published Events
                </h2>
                {publishedEvents.length === 0 ? (
                    <div className="text-center py-8 border border-zinc-800 rounded-lg">
                        <p className="text-text-weak">
                            No published events yet
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {publishedEvents.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Draft Events */}
            <div>
                <h2 className="text-xl font-semibold text-text-strong mb-4">
                    Draft Events
                </h2>
                {draftEvents.length === 0 ? (
                    <div className="text-center py-8 border border-zinc-800 rounded-lg">
                        <p className="text-text-weak">No draft events</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {draftEvents.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Completed Events */}
            <div>
                <h2 className="text-xl font-semibold text-text-strong mb-4">
                    Completed Events
                </h2>
                {completedEvents.length === 0 ? (
                    <div className="text-center py-8 border border-zinc-800 rounded-lg">
                        <p className="text-text-weak">No completed events</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {completedEvents.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Event Card Component
interface EventCardProps {
    event: Event;
}

function EventCard({ event }: EventCardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <Link
            to={`/organizers/event/edit/${event.id}`}
            className="block"
        >
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-accent transition-colors">
                {event.bannerUrl && (
                    <img
                        src={`http://localhost:5050${event.bannerUrl}`}
                        alt={event.title}
                        className="w-full h-40 object-cover"
                    />
                )}
                {!event.bannerUrl && (
                    <div className="w-full h-40 bg-zinc-800 flex items-center justify-center">
                        <span className="text-zinc-500">No Image</span>
                    </div>
                )}
                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-text-strong line-clamp-1">
                            {event.title}
                        </h3>
                        <span
                            className={`px-2 py-1 rounded-full text-xs ${
                                event.status === "published"
                                    ? "bg-green-500/20 text-green-400"
                                    : event.status === "draft"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-blue-500/20 text-blue-400"
                            }`}
                        >
                            {event.status.charAt(0).toUpperCase() +
                                event.status.slice(1)}
                        </span>
                    </div>
                    <p className="text-sm text-text-weak line-clamp-2 mb-3">
                        {event.description}
                    </p>
                    <div className="flex items-center text-xs text-zinc-500">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
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
                        <span className="truncate">
                            {event.address}, {event.city}, {event.country}
                        </span>
                    </div>
                    <div className="flex items-center text-xs text-zinc-500 mt-1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <span>
                            {formatDate(event.startDate)}
                            {event.endDate && ` - ${formatDate(event.endDate)}`}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
