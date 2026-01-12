// client/src/components/admin/OrganizerDetails.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

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

export default function OrganizerDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [organizer, setOrganizer] = useState<Organizer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrganizerDetails = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5050/api/organizers/${id}`,
                    {
                        headers: {
                            Authorization: "Bearer admin-token",
                        },
                    }
                );
                const data = await response.json();
                setOrganizer(data.organizer);
            } catch (error) {
                console.error("Error fetching organizer details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizerDetails();
    }, [id]);

    const handleApprove = async () => {
        try {
            await fetch(`http://localhost:5050/api/organizers/${id}/approve`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer admin-token",
                },
            });
            navigate("/admin/pending");
        } catch (error) {
            console.error("Error approving organizer:", error);
        }
    };

    const handleReject = async () => {
        try {
            await fetch(`http://localhost:5050/api/organizers/${id}/reject`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer admin-token",
                },
            });
            navigate("/admin/pending");
        } catch (error) {
            console.error("Error rejecting organizer:", error);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <p className="text-text-weak">Loading organizer details...</p>
            </div>
        );
    }

    if (!organizer) {
        return (
            <div className="text-center py-8">
                <p className="text-text-weak">Organizer not found</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-text-strong">
                    Organizer Details
                </h1>
                <div className="space-x-3">
                    <button
                        onClick={handleApprove}
                        className="px-4 py-2 bg-green-200 text-black rounded-lg hover:bg-green-400"
                    >
                        Approve
                    </button>
                    <button
                        onClick={handleReject}
                        className="px-4 py-2 bg-danger text-black rounded-lg hover:bg-danger-80"
                    >
                        Reject
                    </button>
                </div>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-lg font-semibold text-text-strong mb-4">
                            Basic Information
                        </h2>
                        <div className="space-y-2">
                            <p>
                                <span className="text-text-weak">Name:</span>{" "}
                                {organizer.name}
                            </p>
                            <p>
                                <span className="text-text-weak">Email:</span>{" "}
                                {organizer.email}
                            </p>
                            <p>
                                <span className="text-text-weak">Phone:</span>{" "}
                                {organizer.phone}
                            </p>
                            <p>
                                <span className="text-text-weak">Address:</span>{" "}
                                {organizer.address}
                            </p>
                            <p>
                                <span className="text-text-weak">City:</span>{" "}
                                {organizer.city}
                            </p>
                            <p>
                                <span className="text-text-weak">Country:</span>{" "}
                                {organizer.country}
                            </p>
                            <p>
                                <span className="text-text-weak">Website:</span>{" "}
                                {organizer.website}
                            </p>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-text-strong mb-4">
                            Details
                        </h2>
                        <div className="space-y-2">
                            <p>
                                <span className="text-text-weak">
                                    Description:
                                </span>
                            </p>
                            <p className="text-text-weak">
                                {organizer.description}
                            </p>
                            <p>
                                <span className="text-text-weak">Status:</span>{" "}
                                {organizer.status}
                            </p>
                            <p>
                                <span className="text-text-weak">Created:</span>{" "}
                                {new Date(organizer.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <h2 className="text-lg font-semibold text-text-strong mb-4">
                    Proof Document
                </h2>
                {organizer.proofUrl ? (
                    <div className="flex flex-col items-center">
                        <a
                            href={`http://localhost:5050${organizer.proofUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                        >
                            View Proof Document
                        </a>
                        <iframe
                            src={`http://localhost:5050${organizer.proofUrl}`}
                            className="w-full h-96 mt-4 border border-zinc-700 rounded"
                        />
                    </div>
                ) : (
                    <p className="text-text-weak">No proof document provided</p>
                )}
            </div>
        </div>
    );
}
