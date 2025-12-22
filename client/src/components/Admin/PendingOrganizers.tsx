// client/src/components/admin/PendingOrganizers.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface Organizer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    website: string;
    description: string;
    proofUrl: string;
    status: string;
    createdAt: string;
}

export default function PendingOrganizers() {
    const [organizers, setOrganizers] = useState<Organizer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch pending organizers from backend
        const fetchPendingOrganizers = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5050/api/organizers/pending",
                    {
                        headers: {
                            Authorization: "Bearer admin-token",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Make sure the data has the expected structure
                if (data && Array.isArray(data.organizers)) {
                    setOrganizers(data.organizers);
                } else {
                    console.error("Unexpected API response structure:", data);
                    setOrganizers([]);
                }
            } catch (error) {
                console.error("Error fetching pending organizers:", error);
                setError("Failed to load pending organizers");
            } finally {
                setLoading(false);
            }
        };

        fetchPendingOrganizers();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-8">
                <p className="text-text-weak">Loading pending organizers...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-text-strong mb-6">
                Pending Organizers
            </h1>
            {organizers.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-text-weak">
                        No pending organizers found.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {organizers.map((org) => (
                        <Link
                            key={org.id}
                            to={`/admin/pending/${org.id}`}
                            className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:border-accent transition-colors"
                        >
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-text-strong">
                                    {org.name}
                                </h3>
                                <p className="text-text-weak">{org.email}</p>
                                <p className="text-text-weak">
                                    {org.city}, {org.country}
                                </p>
                                <p className="text-sm text-zinc-500 mt-2">
                                    {new Date(
                                        org.createdAt
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
