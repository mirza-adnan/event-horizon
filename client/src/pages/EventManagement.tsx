import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaSpinner, FaArrowLeft, FaBullhorn, FaUsers, FaCog } from "react-icons/fa";
import { cn } from "../utils/helpers";
import AnnouncementFeed from "../components/EventManagement/AnnouncementFeed";
import RegistrantList from "../components/EventManagement/RegistrantList";

interface Segment {
    id: string;
    name: string;
}

interface Event {
    id: string;
    title: string;
    segments: Segment[];
}

export default function EventManagement() {
    const { id } = useParams();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("feed"); // 'feed' | 'registrations' | 'settings'
    const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null); // null = Global

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                // Fetch basic event info + segments to populate tabs
                const res = await fetch(`http://localhost:5050/api/events/${id}`);
                const data = await res.json();
                if (res.ok) {
                    setEvent(data.event);
                }
            } catch (err) {
                console.error("Failed to fetch event", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    if (loading) return <div className="p-10 flex justify-center"><FaSpinner className="animate-spin text-accent text-2xl" /></div>;
    if (!event) return <div className="p-10 text-center">Event not found</div>;

    return (
        <div className="flex bg-zinc-950 min-h-screen">
            {/* Sidebar / Sub-nav */}
            <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-zinc-800">
                    <Link to="/organizers/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4">
                        <FaArrowLeft size={12} /> Back to Events
                    </Link>
                    <h1 className="font-bold text-white text-xl leading-tight">{event.title}</h1>
                    <span className="text-xs text-zinc-500 mt-1 block">Management Console</span>
                </div>

                <nav className="p-4 space-y-2 flex-1">
                    <button 
                        onClick={() => setActiveTab("feed")}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                            activeTab === "feed" ? "bg-accent text-black font-medium" : "text-zinc-400 hover:bg-zinc-800"
                        )}
                    >
                        <FaBullhorn /> Announcements
                    </button>
                    <button 
                         onClick={() => setActiveTab("registrations")}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                            activeTab === "registrations" ? "bg-accent text-black font-medium" : "text-zinc-400 hover:bg-zinc-800"
                        )}
                    >
                        <FaUsers /> Registrations
                    </button>
                     <button 
                         onClick={() => setActiveTab("settings")}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                            activeTab === "settings" ? "bg-accent text-black font-medium" : "text-zinc-400 hover:bg-zinc-800"
                        )}
                    >
                        <FaCog /> Settings
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header for Segment Filtering */}
                <header className="h-16 border-b border-zinc-800 flex items-center px-6 bg-zinc-900/50 backdrop-blur justify-between">
                    <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setSelectedSegmentId(null)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
                                selectedSegmentId === null 
                                    ? "bg-white text-black border-white" 
                                    : "bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-white"
                            )}
                        >
                            {event.title}
                        </button>
                        {event.segments && event.segments.length > 1 && event.segments.map(seg => (
                            <button
                                key={seg.id}
                                onClick={() => setSelectedSegmentId(seg.id)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
                                    selectedSegmentId === seg.id
                                        ? "bg-white text-black border-white" 
                                        : "bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-white"
                                )}
                            >
                                {seg.name}
                            </button>
                        ))}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {activeTab === "feed" && (
                        <AnnouncementFeed 
                            eventId={event.id} 
                            segmentId={selectedSegmentId} 
                            feedLabel={selectedSegmentId 
                                ? event.segments?.find(s => s.id === selectedSegmentId)?.name || "Segment"
                                : event.title
                            }
                        />
                    )}
                    {activeTab === "registrations" && (
                        <RegistrantList eventId={event.id} segmentId={selectedSegmentId} />
                    )}
                    {activeTab === "settings" && (
                        <div className="text-zinc-500">Settings: Edit event, etc. (Placeholder)</div>
                    )}
                </main>
            </div>
        </div>
    );
}
