import { FaMapMarkerAlt, FaCalendarAlt, FaExternalLinkAlt, FaGlobe } from "react-icons/fa";

interface ExternalEventProps {
    title: string;
    startDate: string;
    imageUrl?: string;
    location: string;
    isOnline: boolean;
    link: string;
    categories: string[];
    onClick?: () => void;
}

function ExternalEventCard({
    title,
    startDate,
    imageUrl,
    location,
    isOnline,
    link,
    categories,
    onClick,
}: ExternalEventProps) {
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div 
            onClick={() => {
                if (onClick) onClick();
                window.open(link, "_blank");
            }}
            className="group relative bg-[#1c1c1c] rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-accent/20 transition-all duration-300 border border-gray-800 hover:border-accent flex flex-col h-full"
        >
            {/* Image Container with Overlay */}
            <div className="relative h-48 w-full overflow-hidden">
                <img 
                    src={imageUrl || "https://placehold.co/600x400/1c1c1c/FFF?text=Event"} 
                    alt={title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1c] to-transparent opacity-80" />
                <div className="absolute top-3 right-3">
                    {isOnline && (
                        <span className="bg-accent/90 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <FaGlobe /> Online
                        </span>
                    )}
                </div>
            </div>

            {/* Content info */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {categories.map((cat, index) => (
                        <span key={index} className="text-[10px] uppercase font-semibold tracking-wider text-accent bg-accent/10 px-2 py-1 rounded">
                            {cat}
                        </span>
                    ))}
                </div>

                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-accent transition-colors">
                    {title}
                </h3>

                <div className="mt-auto space-y-2 text-gray-400 text-sm">
                    <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-accent" />
                        <span>{formatDate(startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-accent" />
                        <span className="line-clamp-1">{location || "Location TBD"}</span>
                    </div>
                </div>

                {/* Hover Action Indication */}
                <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="bg-accent text-white p-2 rounded-full shadow-lg">
                        <FaExternalLinkAlt />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExternalEventCard;
