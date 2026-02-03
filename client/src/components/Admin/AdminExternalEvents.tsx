import { useState, useEffect } from "react";
import { FaTrash, FaSync, FaExternalLinkAlt, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";

interface ExternalEvent {
    id: string;
    title: string;
    slug: string;
    description?: string;
    startDate: string;
    imageUrl?: string;
    location?: string;
    isOnline: boolean;
    link: string;
    categories: string[];
    clicks: number;
    hovers: number;
    createdAt: string;
}

export default function AdminExternalEvents() {
    const [events, setEvents] = useState<ExternalEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [scraping, setScraping] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchEvents = async () => {
        try {
            const response = await fetch("http://localhost:5050/api/external-events");
            if (!response.ok) throw new Error("Failed to fetch events");
            const data = await response.json();
            setEvents(data.events);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: "Failed to load events" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleScrape = async () => {
        setScraping(true);
        setMessage(null);
        try {
            const response = await fetch("http://localhost:5050/api/external-events/scrape-seed", {
                method: "POST",
            });
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error || "Scrape failed");

            setMessage({ type: 'success', text: `Scrape complete. Added ${data.added} new events.` });
            if (data.added > 0) {
                fetchEvents();
            }
        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: error.message || "Scraping failed" });
        } finally {
            setScraping(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        try {
            const response = await fetch(`http://localhost:5050/api/external-events/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Delete failed");
            
            setEvents(events.filter(e => e.id !== id));
            setMessage({ type: 'success', text: "Event deleted successfully" });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: "Failed to delete event" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">External Events Management</h2>
                <button
                    onClick={handleScrape}
                    disabled={scraping}
                    className="bg-accent text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <FaSync className={scraping ? "animate-spin" : ""} />
                    {scraping ? "Scraping & Seeding..." : "Scrape External Events"}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-900' : 'bg-red-900/20 text-red-400 border border-red-900'}`}>
                    {message.text}
                </div>
            )}

            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading events...</div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 text-gray-500 bg-zinc-900 rounded-lg border border-zinc-800">
                    No external events found. Click "Scrape" to populate.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {events.map((event) => (
                        <div key={event.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col md:flex-row gap-4 hover:border-accent/30 transition-colors">
                            {/* Image */}
                            <div className="w-full md:w-48 h-32 flex-shrink-0 bg-zinc-800 rounded-md overflow-hidden relative">
                                {event.imageUrl ? (
                                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-zinc-600">No Image</div>
                                )}
                                {event.isOnline && (
                                    <span className="absolute top-2 right-2 bg-accent text-black text-xs font-bold px-2 py-1 rounded">Online</span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-grow space-y-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-white hover:text-accent transition-colors">
                                        <a href={event.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                            {event.title} <FaExternalLinkAlt className="text-sm opacity-50" />
                                        </a>
                                    </h3>
                                    <button 
                                        onClick={() => handleDelete(event.id)}
                                        className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-red-900/20 transition-all"
                                        title="Delete Event"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                                
                                <button
                                    onClick={() => {
                                        const link = `${window.location.origin}/organizers/event/create?import_url=${encodeURIComponent(event.link)}`;
                                        navigator.clipboard.writeText(link);
                                        setMessage({ type: 'success', text: "Invite link copied to clipboard!" });
                                        setTimeout(() => setMessage(null), 3000);
                                    }}
                                    className="text-sm text-accent hover:text-white underline mt-1 block w-fit"
                                >
                                    Copy Invite Link
                                </button>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <FaCalendarAlt className="text-accent" /> {new Date(event.startDate).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FaMapMarkerAlt className="text-accent" /> {event.location || "N/A"}
                                    </span>
                                </div>

                                <div className="flex gap-2 mt-2">
                                    {event.categories.map((cat, i) => (
                                        <span key={i} className="text-xs bg-zinc-800 text-gray-300 px-2 py-1 rounded border border-zinc-700">
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="w-full md:w-32 flex-shrink-0 flex md:flex-col justify-between md:justify-center gap-2 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{event.clicks}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Clicks</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{event.hovers}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Hovers</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
