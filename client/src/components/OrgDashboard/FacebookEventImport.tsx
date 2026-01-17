import { useState } from "react";
import Input from "../Input";

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
}

export default function FacebookEventImport({
    onScrapeComplete,
}: FacebookEventImportProps) {
    const [facebookUrl, setFacebookUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateUrl = (url: string) => {
        const facebookRegex =
            /^(https?:\/\/)?(www\.)?facebook\.com\/events\/.*$/i;
        return facebookRegex.test(url);
    };

    const handleScrape = async () => {
        if (!validateUrl(facebookUrl)) {
            setError("Please enter a valid Facebook event URL");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log("here1");
            const response = await fetch(
                "http://localhost:5050/api/events/scrape-facebook",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ url: facebookUrl }),
                    credentials: "include",
                }
            );
            console.log("here2");

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to scrape event");
            }

            console.log("here3");

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
        <div className="mb-6 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
            <h3 className="text-lg font-medium mb-3">
                Import from Facebook Event
            </h3>
            <p className="text-sm text-text-weak mb-4">
                Paste a Facebook event link to automatically fill event details
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
                <Input
                    type="url"
                    placeholder="https://www.facebook.com/events/..."
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    className="flex-1 w-full"
                />
                <button
                    onClick={handleScrape}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-accent text-black font-medium disabled:opacity-50"
                >
                    {loading ? "Importing..." : "Import"}
                </button>
            </div>

            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
    );
}
