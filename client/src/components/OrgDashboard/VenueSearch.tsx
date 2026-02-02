import { useState, useEffect, useRef } from "react";
import { FaSearch, FaMapMarkerAlt, FaSpinner } from "react-icons/fa";

interface VenueSearchResult {
    name: string;
    city?: string;
    country?: string;
    lat: number;
    lng: number;
    fullAddress: string;
}

interface VenueSearchProps {
    onSelect: (result: VenueSearchResult) => void;
    placeholder?: string;
}

export default function VenueSearch({ onSelect, placeholder = "Search for a venue..." }: VenueSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<VenueSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length > 2) {
                searchVenues(query);
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const searchVenues = async (searchQuery: string) => {
        setLoading(true);
        try {
            // Photon API (Free, no key required)
            const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=5`);
            const data = await res.json();
            
            if (data.features) {
                const formattedResults = data.features.map((feature: any) => {
                    const p = feature.properties;
                    const coords = feature.geometry.coordinates; // [lng, lat]
                    
                    const name = p.name || p.street || "";
                    const city = p.city || p.state || "";
                    const country = p.country || "";
                    
                    // Construct a readable full address
                    const parts = [name, city, country].filter(Boolean);
                    const fullAddress = parts.join(", ");

                    return {
                        name,
                        city,
                        country,
                        lat: coords[1],
                        lng: coords[0],
                        fullAddress
                    };
                });
                setResults(formattedResults);
                setIsOpen(true);
            }
        } catch (error) {
            console.error("Venue search error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (result: VenueSearchResult) => {
        onSelect(result);
        setQuery(result.name);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length > 2 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:ring-2 focus:ring-accent outline-none transition-all"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                    {loading ? <FaSpinner className="animate-spin" /> : <FaSearch size={14} />}
                </div>
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-[1001] w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
                    {results.map((result, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSelect(result)}
                            className="w-full flex items-start gap-3 p-4 hover:bg-zinc-800 transition-colors text-left border-b border-zinc-800/50 last:border-0"
                        >
                            <div className="mt-1 text-accent">
                                <FaMapMarkerAlt size={14} />
                            </div>
                            <div>
                                <div className="font-bold text-white text-sm">{result.name}</div>
                                <div className="text-zinc-500 text-xs mt-0.5">{result.fullAddress}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
