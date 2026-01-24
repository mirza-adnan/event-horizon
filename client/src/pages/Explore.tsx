import { useEffect, useState } from "react";
import ExternalEventCard from "../components/ExternalEventCard";
import { fetchExternalEvents } from "../utils/api";
import { FaCompass, FaSpinner, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";

interface ExternalEvent {
    id: string; // Added ID
    title: string;
    startDate: string;
    imageUrl?: string;
    location: string;
    isOnline: boolean;
    link: string;
    categories: string[];
}

interface PlatformEvent {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate?: string;
    bannerUrl?: string;
    city: string;
    country: string;
    isOnline: boolean;
}

function Explore() {
    const [events, setEvents] = useState<ExternalEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Platform Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [platformEvents, setPlatformEvents] = useState<PlatformEvent[]>([]);
    const [loadingPlatform, setLoadingPlatform] = useState(false);

    useEffect(() => {
        const loadEvents = async () => {
            try {
                const data = await fetchExternalEvents();
                // Check if data.events exists (backend structure might be { events: [...] })
                setEvents(data.events || data);
            } catch (err) {
                setError("Failed to load events. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadEvents();
       
        // Initial load of platform events (no query = default list)
        handleSearch("");
    }, []);

    const handleSearch = async (query: string) => {
        setLoadingPlatform(true);
        setLoading(true); // Also load external events
        try {
            // Parallel fetch for both platform and external events
            const [platformRes, externalData] = await Promise.all([
                fetch(`http://localhost:5050/api/events/search?q=${encodeURIComponent(query)}&limit=10`),
                fetchExternalEvents(query)
            ]);

            const platformData = await platformRes.json();
            if (platformRes.ok) {
                setPlatformEvents(platformData.events);
            }
           
            // Handle external events response
            // The API returns { events: [...] }
            setEvents(externalData.events || externalData);

        } catch (e) {
            console.error("Search failed", e);
            setError("Search failed. Please try again.");
        } finally {
            setLoadingPlatform(false);
            setLoading(false);
        }
    };

    const onSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(searchQuery);
    };

    const handleHover = async (id: string) => {
        try {
            await fetch(`http://localhost:5050/api/external-events/${id}/stats`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "hover" }),
            });
        } catch (e) {
            // Ignore stats errors
        }
    };

    const handleClick = async (id: string) => {
        try {
            await fetch(`http://localhost:5050/api/external-events/${id}/stats`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "click" }),
            });
        } catch (e) {
            // Ignore stats errors
        }
    };

    return (
        <div className="flex flex-col">
            <main className="flex-grow container mx-auto px-6 py-10 max-w-7xl">
                <div className="flex flex-col items-center mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-4 jaro tracking-wide">
                        Explore Events
                    </h1>
                    <p className="text-gray-400 max-w-2xl text-lg mb-8">
                        Discover exciting competitions, workshops, and conferences happening around you.
                        Curated from across the web.
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={onSearchSubmit} className="relative w-full max-w-xl">
                        <input
                            type="text"
                            placeholder="Find events (e.g., 'React workshop', 'Hackathon next week')..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-full bg-zinc-900/80 border border-zinc-700 focus:border-accent text-white outline-none transition-colors"
                        />
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-accent text-black px-4 py-1.5 rounded-full font-medium hover:bg-accent/90 transition-colors"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Two Column Layout: Main Content + Sidebar */}
                <div className="flex gap-8">
                    {/* Main Content - Platform Events */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white border-l-4 border-accent pl-3">
                                Platform Events
                            </h2>
                        </div>

                        {loadingPlatform ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <FaSpinner className="animate-spin text-accent text-3xl mb-4" />
                                <p className="text-gray-400">Loading platform events...</p>
                            </div>
                        ) : platformEvents.length === 0 ? (
                            <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
                                <p className="text-gray-400">No events found matching your search.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {platformEvents.map((event) => (
                                    <Link key={event.id} to={`/events/${event.id}`} className="group block bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-accent transition-colors">
                                        <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                                            {event.bannerUrl ? (
                                                <img
                                                    src={`http://localhost:5050${event.bannerUrl}`}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-accent transition-colors">{event.title}</h3>
                                            </div>
                                            <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                                           
                                            <div className="flex items-center gap-4 text-sm text-zinc-500">
                                                <span>{new Date(event.startDate).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>{event.isOnline ? "Online" : event.city}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar - External Events */}
                    <div className="w-80 flex-shrink-0">
                        <div className="sticky top-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white border-l-4 border-accent pl-3">
                                    External Events
                                </h2>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <FaSpinner className="animate-spin text-accent text-3xl mb-4" />
                                    <p className="text-gray-400 text-sm">Loading...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-10 bg-red-900/10 rounded-xl border border-red-900/50">
                                    <p className="text-red-400 text-sm mb-2">Something went wrong</p>
                                    <p className="text-gray-500 text-xs">{error}</p>
                                </div>
                            ) : events.length === 0 ? (
                                <div className="text-center py-10 bg-zinc-900/50 rounded-xl border border-zinc-800">
                                    <FaCompass className="text-4xl text-gray-700 mx-auto mb-3" />
                                    <p className="text-gray-400 text-sm">No external events found.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                                    {events.map((event) => (
                                        <div
                                            key={event.id}
                                            onMouseEnter={() => handleHover(event.id)}
                                            onClick={() => handleClick(event.id)}
                                        >
                                            <ExternalEventCard {...event} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Explore;
