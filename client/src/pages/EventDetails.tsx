import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaTag, FaSpinner, FaCheckCircle } from "react-icons/fa";
import { useUserAuth } from "../hooks/useUserAuth";
import RegistrationModal from "../components/RegistrationModal";

interface Segment {
    id: string;
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    isTeamSegment: boolean;
    registrationFee: number;
    // ...
}

interface Event {
    id: string;
    title: string;
    description: string;
    bannerUrl?: string;
    startDate: string;
    endDate: string;
    location: string;
    city: string;
    isOnline: boolean;
    segments: Segment[];
    organizer: {
        name: string;
    }
}

export default function EventDetails() {
    const { id } = useParams();
    const { user } = useUserAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            // Note: We need a public endpoint for event details that includes segments
            // Assuming GET /api/events/:id exists and returns populated data
            const res = await fetch(`http://localhost:5050/api/events/${id}`);
            if (res.ok) {
                const data = await res.json();
                setEvent(data.event);
            } else {
                setError("Event not found");
            }
        } catch (err) {
            setError("Error loading event");
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterClick = (segment: Segment) => {
        if (!user) {
            // Redirect to login or show alert
            alert("Please login to register");
            return;
        }
        setSelectedSegment(segment);
        setIsRegisterModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 min-h-screen bg-zinc-950">
                <FaSpinner className="animate-spin text-accent text-3xl" />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="text-center py-20 min-h-screen bg-zinc-950 text-white">
                <h2 className="text-2xl font-bold mb-4">{error || "Event not found"}</h2>
                <Link to="/explore" className="text-accent hover:underline">Back to Explore</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 pb-20">
            {/* Banner */}
            <div className="h-[300px] md:h-[400px] relative">
                {event.bannerUrl ? (
                    <img src={`http://localhost:5050${event.bannerUrl}`} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-zinc-800 to-zinc-900 flex items-center justify-center">
                        <span className="text-zinc-700 text-6xl font-bold opacity-20">Event Horizon</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 p-8 w-full max-w-7xl mx-auto">
                    <div className="flex gap-4 mb-4">
                        <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium border border-accent/20 backdrop-blur-sm">
                            {event.isOnline ? "Online" : "In Person"}
                        </span>
                        {/* Categories could go here */}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 shadow-lg">{event.title}</h1>
                    <div className="flex flex-wrap gap-6 text-gray-300">
                        <div className="flex items-center gap-2">
                             <FaCalendarAlt className="text-accent" />
                             <span>{new Date(event.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <FaMapMarkerAlt className="text-accent" />
                             <span>{event.isOnline ? "Online" : `${event.location}, ${event.city}`}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <FaUsers className="text-accent" />
                             <span>Hosted by {event.organizer?.name}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">
                     <section>
                         <h2 className="text-2xl font-bold text-white mb-4">About Event</h2>
                         <p className="text-gray-400 whitespace-pre-wrap leading-relaxed">{event.description}</p>
                     </section>

                     <section>
                         <h2 className="text-2xl font-bold text-white mb-6">Segments & Activities</h2>
                         {!event.segments || event.segments.length === 0 ? (
                             <p className="text-gray-500">No segments listed yet.</p>
                         ) : (
                             <div className="space-y-4">
                                 {event.segments.map(segment => (
                                     <div key={segment.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 transition-colors hover:border-zinc-700">
                                         <div className="flex justify-between items-start mb-4">
                                             <div>
                                                 <h3 className="text-xl font-bold text-white mb-2">{segment.name}</h3>
                                                 <div className="flex gap-3 text-sm">
                                                     {segment.isTeamSegment ? (
                                                         <span className="flex items-center gap-1 text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded">
                                                             <FaUsers size={12} /> Team Event
                                                         </span>
                                                     ) : (
                                                         <span className="flex items-center gap-1 text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
                                                             <FaUsers size={12} /> Individual
                                                         </span>
                                                     )}
                                                     {segment.registrationFee > 0 ? (
                                                         <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded">
                                                             ৳{segment.registrationFee}
                                                         </span>
                                                     ) : (
                                                         <span className="text-gray-400 bg-gray-400/10 px-2 py-0.5 rounded">Free</span>
                                                     )}
                                                 </div>
                                             </div>
                                             <button 
                                                 onClick={() => handleRegisterClick(segment)}
                                                 className="bg-accent text-black px-6 py-2 rounded-lg font-bold hover:bg-accent/90 transition-colors shadow-lg shadow-accent/10"
                                             >
                                                 Register
                                             </button>
                                         </div>
                                         <p className="text-gray-400 text-sm mb-4">{segment.description}</p>
                                         <div className="flex gap-4 text-xs text-zinc-500 font-mono">
                                             <span>Start: {new Date(segment.startTime).toLocaleString()}</span>
                                             {segment.endTime && <span>End: {new Date(segment.endTime).toLocaleString()}</span>}
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         )}
                     </section>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    {/* Organizer Card */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Organizer</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-xl font-bold text-zinc-500">
                                {event.organizer?.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-white">{event.organizer?.name}</p>
                                <a href="#" className="text-xs text-accent hover:underline">View Profile</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Modal */}
             {isRegisterModalOpen && selectedSegment && (
                <RegistrationModal
                    isOpen={isRegisterModalOpen}
                    onClose={() => setIsRegisterModalOpen(false)}
                    event={event}
                    segment={selectedSegment}
                />
            )}
        </div>
    );
}
