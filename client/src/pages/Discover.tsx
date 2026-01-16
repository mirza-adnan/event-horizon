import { useEffect, useState } from "react";
import { fetchExternalEvents } from "../services/externalEvents";
import type { ScrapedEvent } from "../types/externalEvents";
import EventCard from "../components/ExternalEvents/EventCard";
import { FiSearch, FiFilter, FiGrid, FiList } from "react-icons/fi";
import SimplifiedNavBar from "../components/Shared/SimplifiedNavBar";

const Discover = () => {
    const [events, setEvents] = useState<ScrapedEvent[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [sourceFilter, setSourceFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest"); // newest, oldest, prize-high, az, za
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [activeTab, setActiveTab] = useState<"upcoming" | "archive">("upcoming");

    useEffect(() => {
        const getEvents = async () => {
            setLoading(true);
            const data = await fetchExternalEvents();
            setEvents(data);
            setLoading(false);
        };
        getEvents();
    }, []);

    const parsePrize = (prizeStr?: string) => {
        if (!prizeStr) return 0;
        // Remove symbols like $, commas, etc.
        const num = parseFloat(prizeStr.replace(/[^0-9.]/g, ""));
        return isNaN(num) ? 0 : num;
    };

    const now = new Date();

    const filteredEvents = events
        .filter((e) => {
            const eventDate = new Date(e.startDate || 0);
            const isUpcoming = eventDate >= now;
            
            if (activeTab === "upcoming" && !isUpcoming) return false;
            if (activeTab === "archive" && isUpcoming) return false;

            const matchesSearch =
                e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (e.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());

            const loc = e.location?.toLowerCase() || "";
            const isOnline = loc.includes("online") || loc.includes("remote") || loc.includes("everywhere") || loc.includes("worldwide");

            const matchesType =
                typeFilter === "all" ||
                (typeFilter === "online" && isOnline) ||
                (typeFilter === "in-person" && !isOnline);

            const matchesSource =
                sourceFilter === "all" || e.source.toLowerCase() === sourceFilter.toLowerCase();

            return matchesSearch && matchesType && matchesSource;
        })
        .sort((a, b) => {
            if (sortBy === "newest") {
                return new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime();
            }
            if (sortBy === "oldest") {
                return new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime();
            }
            if (sortBy === "prize-high") {
                return parsePrize(b.prize) - parsePrize(a.prize);
            }
            if (sortBy === "az") {
                return a.title.localeCompare(b.title);
            }
            if (sortBy === "za") {
                return b.title.localeCompare(a.title);
            }
            return 0;
        });

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
            <SimplifiedNavBar />

            {/* Sub-header with Tabs */}
            <div className="bg-zinc-900/50 border-b border-zinc-800">
                <div className="container mx-auto px-6 lg:px-24">
                    <div className="flex gap-8">
                        <button 
                            onClick={() => setActiveTab("upcoming")}
                            className={`py-4 text-sm font-semibold transition-all relative ${
                                activeTab === "upcoming" ? "text-accent" : "text-zinc-500 hover:text-zinc-300"
                            }`}
                        >
                            Upcoming Events
                            {activeTab === "upcoming" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                        </button>
                        <button 
                            onClick={() => setActiveTab("archive")}
                            className={`py-4 text-sm font-semibold transition-all relative ${
                                activeTab === "archive" ? "text-accent" : "text-zinc-500 hover:text-zinc-300"
                            }`}
                        >
                            Archive (Past Events)
                            {activeTab === "archive" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 container mx-auto px-6 lg:px-24 py-8 gap-8">
                {/* Sidebar Filters */}
                <aside className="w-64 flex-shrink-0 hidden md:block border-r border-zinc-800 pr-8">
                    <div className="sticky top-24 space-y-8 text-white">
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
                                <FiFilter className="text-accent" /> Filters
                            </h3>
                            
                            <div className="space-y-6">
                                {/* Type Filter */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Event Type</label>
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all text-white"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="online">Online</option>
                                        <option value="in-person">In-Person</option>
                                    </select>
                                </div>

                                {/* Source Filter */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Source</label>
                                    <select
                                        value={sourceFilter}
                                        onChange={(e) => setSourceFilter(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all text-white"
                                    >
                                        <option value="all">All Sources</option>
                                        <option value="devpost">Devpost</option>
                                        <option value="mlh">MLH</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 space-y-6">
                    {/* Top Search & Actions Bar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-accent transition-colors" />
                            <input
                                type="text"
                                placeholder={`Search for ${activeTab} hackathons...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                            />
                        </div>

                        <div className="flex gap-2">
                            {/* Sorting Dropdown */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent text-white"
                            >
                                <option value="newest">Sort by Date (Newest)</option>
                                <option value="oldest">Sort by Date (Oldest)</option>
                                <option value="prize-high">Highest Prize</option>
                                <option value="az">Title A-Z</option>
                                <option value="za">Title Z-A</option>
                            </select>

                            {/* View Toggle */}
                            <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 rounded-lg transition-all ${
                                        viewMode === "grid" ? "bg-accent text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"
                                    }`}
                                    title="Grid View"
                                >
                                    <FiGrid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 rounded-lg transition-all ${
                                        viewMode === "list" ? "bg-accent text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-200"
                                    }`}
                                    title="List View"
                                >
                                    <FiList size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Stat */}
                    <div className="flex justify-between items-center text-zinc-500 text-sm">
                        <p>Showing {filteredEvents.length} {activeTab} events</p>
                    </div>

                    {/* Grid/List */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-zinc-500 animate-pulse jaro tracking-widest uppercase">Fetching Hackathons...</p>
                        </div>
                    ) : filteredEvents.length > 0 ? (
                        <div
                            className={
                                viewMode === "grid"
                                    ? "grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                                    : "flex flex-col gap-4"
                            }
                        >
                            {filteredEvents.map((event) => (
                                <EventCard key={event.id} event={event} viewMode={viewMode} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
                            <FiSearch size={48} className="mx-auto text-zinc-700 mb-4" />
                            <p className="text-zinc-400">No {activeTab} events found matching your criteria.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Discover;
