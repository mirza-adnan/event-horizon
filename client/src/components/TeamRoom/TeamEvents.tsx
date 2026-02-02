import { FaCalendarAlt, FaPaperPlane } from "react-icons/fa";
import { Link } from "react-router-dom";

interface TeamEvent {
    registrationId: string;
    eventId: string;
    eventTitle: string;
    eventBannerUrl?: string;
    eventStartDate: string;
    segmentId: string;
    segmentName: string;
    segmentStartTime: string;
    hasMultipleSegments: boolean;
}

interface TeamEventsProps {
    events: TeamEvent[];
}

export default function TeamEvents({ events }: TeamEventsProps) {
    if (events.length === 0) {
        return (
            <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
                <FaCalendarAlt className="text-zinc-700 text-5xl mx-auto mb-4" />
                <h3 className="text-white font-medium text-lg">No Registered Events</h3>
                <p className="text-zinc-500 max-w-xs mx-auto mt-2">
                    Your team hasn't registered for any upcoming events yet. Explore events and register as a team!
                </p>
                <div className="mt-8">
                    <Link 
                        to="/explore" 
                        className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all hover:scale-105 inline-block shadow-lg shadow-white/5"
                    >
                        Explore Events
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((item) => (
                <Link 
                    key={item.registrationId} 
                    to={`/events/${item.eventId}`}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all hover:-translate-y-1 group shadow-xl"
                >
                    <div className="h-40 w-full relative">
                         {item.eventBannerUrl ? (
                            <img 
                                src={`http://localhost:5050${item.eventBannerUrl}`} 
                                alt={item.eventTitle} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                                <FaCalendarAlt className="text-zinc-700 text-4xl" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                             <div className="bg-accent/20 border border-accent/30 backdrop-blur-md px-3 py-1 rounded-lg inline-block">
                                <p className="text-accent text-[11px] uppercase tracking-widest font-black">
                                    {new Date(item.segmentStartTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <h4 className="text-white font-bold text-xl group-hover:text-accent transition-colors line-clamp-2 leading-tight">
                            {item.hasMultipleSegments ? `${item.segmentName} | ${item.eventTitle}` : item.eventTitle}
                        </h4>
                        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-zinc-800/50">
                             <div className="bg-zinc-800 px-3 py-1 rounded-full">
                                 <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">Team Entry</span>
                             </div>
                             <FaPaperPlane className="ml-auto text-zinc-600 group-hover:text-accent group-hover:translate-x-1 transition-all" size={14} />
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
