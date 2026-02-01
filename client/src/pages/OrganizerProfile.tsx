import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaGlobe, FaMapMarkerAlt, FaCalendarAlt, FaStar, FaUsers } from "react-icons/fa";
import SubscribeButton from "../components/SubscribeButton";

interface Event {
    id: string;
    title: string;
    description: string;
    bannerUrl?: string;
    startDate: string;
    city: string;
    isOnline: boolean;
}

interface Organizer {
    id: string;
    name: string;
    description: string;
    website: string;
    city: string;
    country: string;
    createdAt: string;
    subscriberCount: number;
}

export default function OrganizerProfile() {
    const { id } = useParams();
    const [data, setData] = useState<{
        organizer: Organizer;
        upcomingEvents: Event[];
        completedEvents: Event[];
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`http://localhost:5050/api/organizers/profile/${id}`);
                if (res.ok) {
                    const profileData = await res.json();
                    setData(profileData);
                }
            } catch (error) {
                console.error("Failed to fetch organizer profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-bgr">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-bgr p-8">
                <h1 className="text-3xl font-bold text-white mb-4">Organizer not found</h1>
                <Link to="/explore" className="text-accent hover:underline">Back to Explore</Link>
            </div>
        );
    }

    const { organizer, upcomingEvents, completedEvents } = data;

    return (
        <div className="flex-1 bg-bgr min-h-screen">
            {/* Header / Hero */}
            <div className="relative h-64 bg-zinc-900 border-b border-zinc-800">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                <div className="max-w-6xl mx-auto px-8 h-full flex items-end pb-8 relative z-10">
                    <div className="flex justify-between items-end w-full">
                        <div className="flex flex-col">
                            <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tight">
                                {organizer.name}
                            </h1>
                            <div className="flex items-center gap-6 text-zinc-300">
                                {organizer.city && (
                                    <div className="flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-accent" />
                                        <span>{organizer.city}, {organizer.country}</span>
                                    </div>
                                )}
                                {organizer.website && (
                                    <a href={organizer.website} target="_blank" rel="noopener noreferrer" 
                                       className="flex items-center gap-2 hover:text-accent transition-colors">
                                        <FaGlobe className="text-accent" />
                                        <span>Website</span>
                                    </a>
                                )}
                                <div className="flex items-center gap-2">
                                    <FaUsers className="text-accent" />
                                    <span>{organizer.subscriberCount} Subscribers</span>
                                </div>
                            </div>
                        </div>
                        <SubscribeButton organizerId={organizer.id} />
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* About Section */}
                    <div className="lg:col-span-1 space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-accent rounded-full" />
                                About
                            </h2>
                            <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">
                                {organizer.description || "No description provided."}
                            </p>
                        </div>
                        
                        <div className="pt-8 border-t border-zinc-800/50">
                            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Details</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Member Since</span>
                                    <span className="text-white font-medium">
                                        {new Date(organizer.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Events Sections */}
                    <div className="lg:col-span-2 space-y-16">
                        {/* Upcoming Events */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-8 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FaCalendarAlt className="text-accent" />
                                    Upcoming Events
                                </div>
                                <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-xs font-medium">
                                    {upcomingEvents.length}
                                </span>
                            </h2>
                            
                            {upcomingEvents.length === 0 ? (
                                <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-12 text-center">
                                    <p className="text-zinc-500">No upcoming events at the moment.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {upcomingEvents.map((event) => (
                                        <Link 
                                            key={event.id}
                                            to={`/events/${event.id}`}
                                            className="group block bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-800/50 hover:border-accent/20 rounded-2xl p-4 transition-all duration-300"
                                        >
                                            <div className="flex gap-4">
                                                {event.bannerUrl ? (
                                                    <img 
                                                        src={`http://localhost:5050${event.bannerUrl}`} 
                                                        alt={event.title}
                                                        className="w-24 h-24 rounded-xl object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-24 h-24 rounded-xl bg-zinc-800 flex items-center justify-center">
                                                        <FaCalendarAlt className="text-zinc-700 text-2xl" />
                                                    </div>
                                                )}
                                                <div className="flex-1 flex flex-col justify-center">
                                                    <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors mb-1">
                                                        {event.title}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                                                        <span className="flex items-center gap-1.5">
                                                            <FaCalendarAlt className="text-accent" />
                                                            {new Date(event.startDate).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <FaMapMarkerAlt className="text-accent" />
                                                            {event.isOnline ? "Online" : event.city}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Completed Events Grid */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-8 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FaStar className="text-accent" />
                                    Past Events
                                </div>
                                <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-xs font-medium">
                                    {completedEvents.length}
                                </span>
                            </h2>

                            {completedEvents.length === 0 ? (
                                <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-12 text-center">
                                    <p className="text-zinc-500">No past events recorded yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {completedEvents.map((event) => (
                                        <Link 
                                            key={event.id}
                                            to={`/events/${event.id}`}
                                            className="group relative aspect-square overflow-hidden rounded-2xl bg-zinc-900"
                                        >
                                            {event.bannerUrl ? (
                                                <img 
                                                    src={`http://localhost:5050${event.bannerUrl}`} 
                                                    alt={event.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                                    <FaCalendarAlt className="text-zinc-700 text-3xl" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight">
                                                    {event.title}
                                                </h3>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
