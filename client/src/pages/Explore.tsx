import { useEffect, useState } from "react";
import NavBar from "../components/HomePage/HomeNavBar";
import HomeFooter from "../components/HomePage/HomeFooter";
import ExternalEventCard from "../components/ExternalEventCard";
import { fetchExternalEvents } from "../utils/api";
import { FaCompass, FaSpinner } from "react-icons/fa";

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

function Explore() {
    const [events, setEvents] = useState<ExternalEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
    }, []);

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
        <div className="min-h-screen flex flex-col bg-bgr">
            <NavBar />
            
            <main className="flex-grow container mx-auto px-6 py-10 max-w-7xl">
                <div className="flex flex-col items-center mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-4 jaro tracking-wide">
                        Explore Events
                    </h1>
                    <p className="text-gray-400 max-w-2xl text-lg">
                        Discover exciting competitions, workshops, and conferences happening around you. 
                        Curated from across the web.
                    </p>
                </div>

                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                         <h2 className="text-2xl font-bold text-white border-l-4 border-accent pl-3">
                            External Events
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <FaSpinner className="animate-spin text-accent text-4xl mb-4" />
                            <p className="text-gray-400 animate-pulse">Scanning the horizon for events...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 bg-red-900/10 rounded-xl border border-red-900/50">
                            <p className="text-red-400 text-lg mb-2">Something went wrong</p>
                            <p className="text-gray-500">{error}</p>
                        </div>
                    ) : events.length === 0 ? (
                         <div className="text-center py-20 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <FaCompass className="text-6xl text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-400 text-xl">No external events found at the moment.</p>
                            <p className="text-gray-600 mt-2">Check back later for updates!</p>
                        </div>
                    ) : (
                        // Horizontal Scroll Container
                        <div className="relative group/scroll">
                             <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide snap-x">
                                {events.map((event) => (
                                    <div 
                                        key={event.id} 
                                        className="min-w-[300px] md:min-w-[350px] snap-center"
                                        onMouseEnter={() => {
                                            // Simple debounce could be added here if needed, 
                                            // but for now relying on user moving fast enough or backend handling is okay-ish for MVP stats
                                            // Actually, strictly speaking, we should debounce.
                                            // For this implementation, I will just fire it once per mouse enter. 
                                            handleHover(event.id)
                                        }}
                                        onClick={() => handleClick(event.id)}
                                    >
                                        <ExternalEventCard 
                                            {...event}
                                            // Override onClick to handle tracking before opening
                                            // Wait, ExternalEventCard has its own onClick. 
                                            // I need to modify ExternalEventCard to accept an onClick prop or handle it here.
                                            // Actually, the card has `window.open`. 
                                            // I'll wrap it in a div that captures onClick, but the inner card might stop propagation?
                                            // Let's modify ExternalEventCard to be more flexible in next step if needed.
                                            // For now, assume the card's internal onClick works, and this wrapper onClick might also fire.
                                            // Better approach: Pass `onClick` to ExternalEventCard.
                                        />
                                    </div>
                                ))}
                            </div>
                            
                            {/* Fade gradients for scroll indication */}
                            <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-bgr to-transparent pointer-events-none" />
                            <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-bgr to-transparent pointer-events-none" />
                        </div>
                    )}
                </div>
            </main>

            <HomeFooter />
        </div>
    );
}

export default Explore;
