import type { ScrapedEvent } from "../../types/externalEvents";
import { FaExternalLinkAlt, FaCalendarAlt } from "react-icons/fa";

interface EventCardProps {
    event: ScrapedEvent;
}

const EventCard = ({ event, viewMode = "grid" }: { event: ScrapedEvent; viewMode?: "grid" | "list" }) => {
    return (
        <div className={`bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-accent/50 transition-all duration-300 group flex ${viewMode === "list" ? "flex-row h-48" : "flex-col h-full"}`}>
            <div className={`relative overflow-hidden ${viewMode === "list" ? "w-48 h-full shrink-0" : "h-48 w-full"}`}>
                {event.imageUrl ? (
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-white/30">
                        No Image
                    </div>
                )}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10">
                    {event.source}
                </div>
            </div>

            <div className={`p-5 flex-1 flex ${viewMode === "list" ? "flex-row items-center gap-6" : "flex-col justify-between"} overflow-hidden`}>
                <div className={viewMode === "list" ? "flex-1 min-w-0 pr-4" : ""}>
                     {event.organizer && (
                         <p className="text-xs text-accent mb-1 font-medium tracking-wide uppercase">
                            Hosted by {event.organizer}
                         </p>
                     )}
                     <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                        {event.title}
                     </h3>
                    
                    <div className="flex flex-wrap gap-2 mb-3 text-xs text-text-weak">
                        {event.startDate && (
                            <span className="bg-zinc-800 px-2 py-1 rounded">
                                {new Date(event.startDate).toLocaleDateString("en-GB").replace(/\//g, "-")}
                            </span>
                        )}
                        {event.location && (
                            <span className="bg-zinc-800 px-2 py-1 rounded text-accent">
                                {event.location}
                            </span>
                        )}
                        {event.participants && (
                            <span className="bg-zinc-800 px-2 py-1 rounded text-blue-400">
                                 {event.participants}
                            </span>
                        )}
                    </div>
    
                    {event.prize && (
                        <p className="text-sm font-semibold text-green-400 mb-2">
                            {event.prize === "1" ? "1 non-cash prize" : event.prize}
                        </p>
                    )}
    
                    <p className={`text-sm text-gray-400 flex-1 ${viewMode === "list" ? "line-clamp-2 mb-0" : "line-clamp-3 mb-4"}`}>
                        {event.description || "No description available."}
                    </p>
                </div>

                <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`bg-white/5 hover:bg-accent hover:text-white border border-white/10 rounded-lg text-center text-sm font-medium transition-all flex items-center justify-center gap-2 ${viewMode === "list" ? "shrink-0 px-6 py-3" : "mt-2 block w-full py-2"}`}
                >
                    View Details <FaExternalLinkAlt className="text-xs" />
                </a>
            </div>
        </div>
    );
};

export default EventCard;
