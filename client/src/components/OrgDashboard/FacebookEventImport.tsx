import { useState, useEffect } from "react";
import Input from "../Input";
import { FaChevronDown, FaChevronUp, FaFacebook } from "react-icons/fa";

interface FacebookEventData {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    address: string;
    city: string;
    country: string;
    bannerUrl?: string;
    categories: string[];
}

interface FacebookEventImportProps {
    onScrapeComplete: (data: FacebookEventData) => void;
    initialUrl?: string | null;
}

export default function FacebookEventImport({
    onScrapeComplete,
    initialUrl,
}: FacebookEventImportProps) {
    const [facebookUrl, setFacebookUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasAutoScraped, setHasAutoScraped] = useState(false);

    // Auto-expand and populate if initialUrl is provided
    useEffect(() => {
        if (initialUrl && !hasAutoScraped) {
            setFacebookUrl(initialUrl);
            setIsExpanded(true);
            // We'll trigger the scrape in a separate effect or immediately here
            // but we need to ensure the state is set first.
            // Let's call a minimal version of handleScrape or just depend on initialUrl change
            // But we don't want to infinite loop.
        }
    }, [initialUrl, hasAutoScraped]);

    // Trigger auto-scrape when url is set from props
    useEffect(() => {
        if (initialUrl && facebookUrl === initialUrl && !hasAutoScraped) {
            handleScrape(initialUrl);
            setHasAutoScraped(true);
        }
    }, [facebookUrl, initialUrl, hasAutoScraped]);


    const validateUrl = (url: string) => {
        const facebookRegex =
            /^(https?:\/\/)?(www\.)?facebook\.com\/events\/.*$/i;
        return facebookRegex.test(url);
    };

    const handleScrape = async (urlToScrape: string = facebookUrl) => {
        if (!validateUrl(urlToScrape)) {
            setError("Please enter a valid Facebook event URL");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                "http://localhost:5050/api/events/scrape-facebook",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ url: urlToScrape }),
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to scrape event");
            }

            const data = await response.json();
            onScrapeComplete(data.eventData);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to scrape event"
            );
            console.error("Scraping error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-6 bg-zinc-900 rounded-lg border border-zinc-800 w-full overflow-hidden transition-all duration-200">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-800/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-blue-500 text-xl"><FaFacebook /></span>
                    <div>
                        <h3 className="text-base font-medium text-white">
                            Import from Facebook
                        </h3>
                        <p className="text-xs text-zinc-500">
                            Auto-fill event details from a Facebook event link
                        </p>
                    </div>
                </div>
                {isExpanded ? (
                    <FaChevronUp className="text-zinc-500" />
                ) : (
                    <FaChevronDown className="text-zinc-500" />
                )}
            </button>

            {isExpanded && (
                <div className="p-4 pt-0 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <Input
                            type="url"
                            placeholder="https://www.facebook.com/events/..."
                            value={facebookUrl}
                            onChange={(e) => setFacebookUrl(e.target.value)}
                            className="w-full"
                            containerClassName="flex-1"
                        />
                        <button
                            onClick={() => handleScrape()}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-50 transition-colors whitespace-nowrap"
                        >
                            {loading ? "Importing..." : "Import Event"}
                        </button>
                    </div>

                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </div>
            )}
        </div>
    );
}
