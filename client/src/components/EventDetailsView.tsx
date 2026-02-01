import { useState } from "react";
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaInfoCircle, FaThList, FaRss, FaBell } from "react-icons/fa";
import { Link } from "react-router-dom";
import AnnouncementFeed from "./EventManagement/AnnouncementFeed";
import { cn } from "../utils/helpers";

interface Segment {
// ... (rest of Segment and Event interfaces)
    id: string | number;
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    isTeamSegment: boolean;
    registrationFee?: number;
    categoryId?: string;
}

export interface Event {
    id: string | number;
    title: string;
    description: string;
    bannerUrl?: string;
    startDate: string;
    endDate: string;
    location?: string;
    address: string;
    city: string;
    isOnline: boolean;
    segments: Segment[];
    organizer: {
        id: string;
        name: string;
    };
    eventCategories?: string[];
}

interface EventDetailsViewProps {
    event: Event;
    user?: any;
    registeredSegmentIds?: string[];
    onRegisterClick?: (segment: Segment) => void;
    isPreview?: boolean;
}

export default function EventDetailsView({ event, user, registeredSegmentIds = [], onRegisterClick, isPreview = false }: EventDetailsViewProps) {
    const [activeTab, setActiveTab] = useState("about");
    const [activeFeedSegmentId, setActiveFeedSegmentId] = useState<string | null>(null);

    const isRegistered = (segmentId: string | number) => {
        return registeredSegmentIds.includes(segmentId.toString());
    };

    if (!event) return null;

    const tabs = [
        { id: "about", label: "About", icon: FaInfoCircle },
        { id: "segments", label: "Segments", icon: FaThList },
        { id: "feed", label: "Feed", icon: FaRss },
    ];

    return (
         <div className="min-h-screen bg-zinc-950 pb-20">
            {/* Banner */}
            <div className="h-[300px] md:h-[400px] relative">
                {event.bannerUrl ? (
                    <img src={event.bannerUrl.startsWith("http") || event.bannerUrl.startsWith("blob") ? event.bannerUrl : `http://localhost:5050${event.bannerUrl}`} alt={event.title} className="w-full h-full object-cover" />
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
                        {isPreview && (
                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-medium border border-yellow-500/20 backdrop-blur-sm">
                                Preview Mode
                            </span>
                        )}
                        {event.eventCategories && event.eventCategories.map((cat, index) => (
                            <span key={index} className="px-3 py-1 bg-white/10 text-white rounded-full text-sm font-medium border border-white/10 backdrop-blur-sm">
                                {cat}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 shadow-lg">{event.title}</h1>
                    <div className="flex flex-wrap gap-6 text-gray-300">
                        <div className="flex items-center gap-2">
                             <FaCalendarAlt className="text-accent" />
                             <span>{new Date(event.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <FaMapMarkerAlt className="text-accent" />
                             <span>{event.isOnline ? "Online" : `${event.address}, ${event.city}`}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <FaUsers className="text-accent" />
                             <span>Hosted by {event.organizer?.name || "Organizer"} {user && user.role === 'organizer' && "(You)"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="max-w-7xl mx-auto px-6 mt-8 border-b border-zinc-900">
                <div className="flex gap-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-all duration-200",
                                activeTab === tab.id
                                    ? "text-accent border-accent"
                                    : "text-zinc-500 border-transparent hover:text-white"
                            )}
                        >
                            <tab.icon />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-2">
                     {activeTab === "about" && (
                         <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                             <h2 className="text-2xl font-bold text-white mb-4">About Event</h2>
                             <p className="text-gray-400 whitespace-pre-wrap leading-relaxed">{event.description}</p>
                         </section>
                     )}

                     {activeTab === "segments" && (
                         <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                                                         {segment.registrationFee && segment.registrationFee > 0 ? (
                                                             <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded">
                                                                 ৳{segment.registrationFee}
                                                             </span>
                                                         ) : (
                                                             <span className="text-gray-400 bg-gray-400/10 px-2 py-0.5 rounded">Free</span>
                                                          )}
                                                          {segment.categoryId && (
                                                              <span className="text-accent bg-accent/10 px-2 py-0.5 rounded">
                                                                  {segment.categoryId}
                                                              </span>
                                                         )}
                                                     </div>
                                                 </div>
                                                 <button 
                                                     onClick={() => !isPreview && !isRegistered(segment.id) && onRegisterClick && onRegisterClick(segment)}
                                                     disabled={isPreview || isRegistered(segment.id)}
                                                     className={cn(
                                                         "px-6 py-2 rounded-lg font-bold transition-all duration-200 shadow-lg shadow-accent/10 whitespace-nowrap",
                                                         isPreview 
                                                            ? "bg-zinc-800 text-gray-500 cursor-not-allowed" 
                                                            : isRegistered(segment.id)
                                                                ? "bg-zinc-900 border border-accent/20 text-accent cursor-default shadow-none"
                                                                : "bg-accent text-black hover:bg-accent/90"
                                                     )}
                                                 >
                                                     {isPreview ? "Register (Preview)" : isRegistered(segment.id) ? "Registered" : "Register"}
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
                     )}

                     {activeTab === "feed" && (
                         <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                             {registeredSegmentIds.length === 0 ? (
                                 <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center">
                                     <FaBell className="text-zinc-700 text-5xl mx-auto mb-4" />
                                     <h3 className="text-white font-medium text-lg">Participants Only</h3>
                                     <p className="text-zinc-500">You must be registered for at least one segment to view the event feed.</p>
                                 </div>
                             ) : (
                                 <>
                                     {/* Segment Feed Selector */}
                                     {event.segments && event.segments.length > 1 && (
                                         <div className="flex flex-wrap gap-2 mb-6">
                                             <button
                                                 onClick={() => setActiveFeedSegmentId(null)}
                                                 className={cn(
                                                     "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                                                     activeFeedSegmentId === null
                                                         ? "bg-accent text-black border-accent"
                                                         : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                                                 )}
                                             >
                                                 General Feed
                                             </button>
                                             {event.segments.filter(seg => isRegistered(seg.id)).map(seg => (
                                                 <button
                                                     key={seg.id}
                                                     onClick={() => setActiveFeedSegmentId(seg.id.toString())}
                                                     className={cn(
                                                         "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                                                         activeFeedSegmentId === seg.id.toString()
                                                             ? "bg-accent text-black border-accent"
                                                             : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                                                     )}
                                                 >
                                                     {seg.name} Feed
                                                 </button>
                                             ))}
                                         </div>
                                     )}

                                     <AnnouncementFeed 
                                        eventId={event.id as string} 
                                        segmentId={activeFeedSegmentId} 
                                        feedLabel={activeFeedSegmentId ? event.segments.find(s => s.id.toString() === activeFeedSegmentId)?.name || "Segment" : "General"} 
                                        isOrganizer={false}
                                        showAll={event.segments.length <= 1} 
                                     />
                                 </>
                             )}
                         </div>
                     )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                     {/* Stats/Quick Info? */}
                     {/* ... could add more here ... */}

                    {/* Organizer Card */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Organizer</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-xl font-bold text-zinc-500">
                                {event.organizer?.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-white">{event.organizer?.name}</p>
                                <Link to={`/organizer/${event.organizer?.id}`} className="text-xs text-accent hover:underline">View Profile</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
