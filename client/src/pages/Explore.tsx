import { useEffect, useState } from "react";
import ExternalEventCard from "../components/ExternalEventCard";
import { fetchExternalEvents } from "../utils/api";
import { useUserAuth } from "../hooks/useUserAuth";
import { Link } from "react-router-dom";
import { FaCompass, FaSpinner, FaSearch, FaMapMarkerAlt, FaTags, FaFilter } from "react-icons/fa";

const CATEGORY_OPTIONS = [
    "Tech", "Business", "Education", "Science", "Arts", "Sports", "Music", "Gaming", 
    "Innovation", "Startup", "Workshop", "Competition", "Seminar", "Design", "Networking"
];

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
    categories: string[];
}

function Explore() {
    const [events, setEvents] = useState<ExternalEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Platform Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [platformEvents, setPlatformEvents] = useState<PlatformEvent[]>([]);
    const [loadingPlatform, setLoadingPlatform] = useState(false);
    const { isAuthenticated, user } = useUserAuth();

    // Filters & Geo
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [radius, setRadius] = useState<number>(50); // Default 50km
    const [useNearby, setUseNearby] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState<"events" | "organizers" | "users">("events");
    const [organizers, setOrganizers] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loadingOther, setLoadingOther] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Geolocation error:", error);
                }
            );
        }

        const loadEvents = async () => {
            try {
                const data = await fetchExternalEvents();
                setEvents(data.events || data);
            } catch (err) {
                setError("Failed to load events. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadEvents();
        handleSearch("");
    }, []);

    // Effect to re-search when filters change
    useEffect(() => {
        if (!loading && activeTab === "events") handleSearch(searchQuery);
        else if (activeTab !== "events") handleOtherSearch(searchQuery);
    }, [selectedCategories, radius, userLocation, useNearby, activeTab]);

    const handleOtherSearch = async (query: string) => {
        if (!query) {
            setOrganizers([]);
            setUsers([]);
            return;
        }
        setLoadingOther(true);
        try {
            const endpoint = activeTab === "organizers" ? "organizers" : "users";
            console.log("endpoint:", endpoint);
            const res = await fetch(`http://localhost:5050/api/${endpoint}/search?q=${query}`, {
                credentials: "include"
            });
            const data = await res.json();
            if (activeTab === "organizers") setOrganizers(data.organizers || []);
            else setUsers(data.users || []);
        } catch (e) {
            console.error("Other search failed", e);
            setOrganizers([]);
            setUsers([]);
        } finally {
            setLoadingOther(false);
        }
    };

    const handleSearch = async (query: string) => {
        setLoadingPlatform(true);
        setLoading(true); // Also load external events
        try {
            const params = new URLSearchParams({
                q: query,
                limit: "10",
            });

            selectedCategories.forEach(cat => params.append("categories", cat));
            if (useNearby && userLocation) {
                params.append("lat", userLocation.lat.toString());
                params.append("lng", userLocation.lng.toString());
                params.append("radius", radius.toString());
            }

            // Parallel fetch for both platform and external events
            const [platformRes, externalData] = await Promise.all([
                fetch(`http://localhost:5050/api/events/search?${params.toString()}`, {
                    credentials: "include"
                }),
                fetchExternalEvents(query)
            ]);

            const platformData = await platformRes.json();
            if (platformRes.ok) {
                setPlatformEvents(platformData.events || []);
            }
           
            // Handle external events response
            setEvents(externalData.events || externalData || []);

        } catch (e) {
            console.error("Search failed", e);
            setError("Search failed. Please try again.");
            setPlatformEvents([]);
            setEvents([]);
        } finally {
            setLoadingPlatform(false);
            setLoading(false);
        }
    };

    const onSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setHasSearched(true);
        if (activeTab === "events") {
            handleSearch(searchQuery);
        } else {
            handleOtherSearch(searchQuery);
        }
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

    const handleClick = async (id: string, isPlatform: boolean = false) => {
        try {
            if (isPlatform && isAuthenticated) {
                // Track interest for platform event
                await fetch(`http://localhost:5050/api/events/track-interest`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ eventId: id }),
                    credentials: "include"
                });
            } else if (!isPlatform) {
                // Statistics for external events
                await fetch(`http://localhost:5050/api/external-events/${id}/stats`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "click", userId: user?.id }),
                });
            }
        } catch (e) {
            // Ignore stats/interest errors
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

                    {/* Search Bar & Filter Toggle */}
                    <div className="w-full max-w-xl space-y-4">
                        <form onSubmit={onSearchSubmit} className="relative">
                            <input
                                type="text"
                                placeholder="Search for events, organizers, users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-full bg-zinc-900/80 border border-zinc-700 focus:border-accent text-white outline-none transition-colors"
                            />
                            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-2 rounded-full transition-colors ${showFilters ? 'bg-accent text-black' : 'bg-zinc-800 text-gray-400 hover:text-white'} ${activeTab !== 'events' ? 'hidden' : ''}`}
                                    title="Filters"
                                >
                                    <FaFilter size={14} />
                                </button>
                                <button
                                    type="submit"
                                    className="bg-accent text-black px-4 py-1.5 rounded-full font-medium hover:bg-accent/90 transition-colors"
                                >
                                    Search
                                </button>
                            </div>
                        </form>

                        {/* Search Tabs */}
                        {hasSearched && (
                            <div className="flex justify-center gap-4 mt-8 animate-in fade-in slide-in-from-top-4 duration-300">
                                {["events", "organizers", "users"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={`px-6 py-2 rounded-full text-sm font-bold capitalize transition-all ${
                                            activeTab === tab 
                                                ? 'bg-accent text-black shadow-lg shadow-accent/20' 
                                                : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Expandable Filters */}
                        {showFilters && (
                            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 text-left animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Category Multi-select */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-white font-semibold mb-2">
                                            <FaTags className="text-accent" />
                                            <span>Categories</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {CATEGORY_OPTIONS.map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => {
                                                        setSelectedCategories(prev => 
                                                            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                                                        );
                                                    }}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                                        selectedCategories.includes(cat)
                                                            ? 'bg-accent text-black border-accent'
                                                            : 'bg-zinc-800 text-gray-400 border-zinc-700 hover:border-gray-500 border'
                                                    }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Proximity Slider */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2 text-white font-semibold">
                                                <FaMapMarkerAlt className="text-accent" />
                                                <span>Search Nearby</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs ${useNearby ? 'text-accent' : 'text-gray-500'}`}>
                                                    {useNearby ? 'Active' : 'Disabled'}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setUseNearby(!useNearby)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${useNearby ? 'bg-accent' : 'bg-zinc-700'}`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useNearby ? 'translate-x-6' : 'translate-x-1'}`}
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        {useNearby && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-400">Radius</span>
                                                    <span className="text-accent font-bold">{radius} km</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="500"
                                                    value={radius}
                                                    onChange={(e) => setRadius(parseInt(e.target.value))}
                                                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-accent"
                                                />
                                                <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                                                    <span>1 km</span>
                                                    <span>500 km</span>
                                                </div>
                                            </div>
                                        )}
                                       
                                        {!userLocation && (
                                            <p className="text-[10px] text-yellow-500/80 italic">
                                                * Geolocation access required for nearby search
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Sections */}
                {(!hasSearched || activeTab === "events") ? (
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
                                        <Link 
                                            key={event.id} 
                                            to={`/events/${event.id}`} 
                                            onClick={() => handleClick(event.id, true)}
                                            className="group block bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-accent transition-colors shadow-lg hover:shadow-accent/5"
                                        >
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
                                                {/* Categories */}
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {event.categories && event.categories.map((cat, index) => (
                                                        <span key={index} className="text-[10px] uppercase font-semibold tracking-wider text-accent bg-accent/10 px-2 py-1 rounded">
                                                            {cat}
                                                        </span>
                                                    ))}
                                                </div>

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
                ) : activeTab === "organizers" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loadingOther ? (
                            <div className="col-span-full flex flex-col items-center py-20">
                                <FaSpinner className="animate-spin text-accent text-3xl mb-4" />
                            </div>
                        ) : organizers.length === 0 ? (
                            <div className="col-span-full text-center py-20 text-gray-500">
                                No organizers found matching "{searchQuery}"
                            </div>
                        ) : (
                            organizers.map(org => (
                                <Link 
                                    key={org.id} 
                                    to={`/organizer/${org.id}`}
                                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-accent transition-all group shadow-lg hover:shadow-accent/5"
                                >
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent">{org.name}</h3>
                                    <p className="text-zinc-500 text-sm line-clamp-3 mb-4">{org.description || "No description provided."}</p>
                                    <div className="text-xs text-zinc-600">
                                        {org.city}, {org.country}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {loadingOther ? (
                            <div className="col-span-full flex flex-col items-center py-20">
                                <FaSpinner className="animate-spin text-accent text-3xl mb-4" />
                            </div>
                        ) : users.length === 0 ? (
                            <div className="col-span-full text-center py-20 text-gray-500">
                                No users found matching "{searchQuery}"
                            </div>
                        ) : (
                            users.map(u => (
                                <Link 
                                    key={u.id} 
                                    to={`/user/${u.id}`}
                                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center text-center hover:border-accent transition-all group shadow-lg hover:shadow-accent/5"
                                >
                                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4 text-2xl font-bold text-zinc-600 overflow-hidden border-2 border-zinc-700">
                                        {u.avatarUrl ? (
                                            <img src={u.avatarUrl} alt={u.firstName} className="w-full h-full object-cover" />
                                        ) : (
                                            u.firstName.charAt(0)
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-accent">{u.firstName} {u.lastName}</h3>
                                    <p className="text-zinc-500 text-xs mt-1">{u.email}</p>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Explore;
