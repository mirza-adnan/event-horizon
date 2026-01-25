import { useState, useEffect } from "react";
import { FaTimes, FaUsers, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { Link } from "react-router-dom";

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: any;
    segment: any;
}

export default function RegistrationModal({ isOpen, onClose, event, segment }: RegistrationModalProps) {
    const [step, setStep] = useState(1); // 1: Selection, 2: Success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Team Logic
    const [myTeams, setMyTeams] = useState<any[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState("");
    const [loadingTeams, setLoadingTeams] = useState(false);

    useEffect(() => {
        if (isOpen && segment.isTeamSegment) {
            fetchMyTeams();
        }
    }, [isOpen, segment]);

    const fetchMyTeams = async () => {
        setLoadingTeams(true);
        try {
            const res = await fetch("http://localhost:5050/api/teams/my", {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                // Filter only teams where I am leader? Or API returns role.
                // It's safer to filter for leader role, as usually only leader registers team.
                const leaderTeams = data.teams.filter((t: any) => t.myRole === 'leader');
                setMyTeams(leaderTeams);
                if (leaderTeams.length > 0) setSelectedTeamId(leaderTeams[0].id);
            }
        } catch (err) {
            console.error("Failed to fetch teams", err);
        } finally {
            setLoadingTeams(false);
        }
    };

    const handleRegister = async () => {
        setLoading(true);
        setError(null);

        const body: any = {
            eventId: event.id,
            segmentId: segment.id,
            data: {} // Empty form data for now
        };

        if (segment.isTeamSegment) {
            if (!selectedTeamId) {
                setError("Please select a team");
                setLoading(false);
                return;
            }
            body.teamId = selectedTeamId;
        }

        try {
            const res = await fetch("http://localhost:5050/api/registrations/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                credentials: "include"
            });

            if (res.ok) {
                setStep(2); // Success
            } else {
                const data = await res.json();
                setError(data.message || "Registration failed");
            }
        } catch (err) {
            setError("Network error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 w-full max-w-lg rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <FaTimes />
                </button>

                <div className="p-8">
                    {step === 1 ? (
                        <>
                            <h2 className="text-2xl font-bold text-white mb-2">Registration</h2>
                            <p className="text-gray-400 mb-6">
                                You are registering for <span className="text-accent font-medium">{segment.name}</span>
                            </p>

                            {error && (
                                <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg mb-6 flex items-start gap-3 text-red-400">
                                    <FaExclamationTriangle className="shrink-0 mt-1" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            {segment.isTeamSegment ? (
                                <div className="space-y-4 mb-8">
                                    <label className="block text-sm font-medium text-gray-300">Select Team</label>
                                    
                                    {loadingTeams ? (
                                        <p className="text-gray-500 text-sm">Loading your teams...</p>
                                    ) : myTeams.length === 0 ? (
                                        <div className="bg-yellow-900/10 border border-yellow-900/30 p-4 rounded-lg text-yellow-500 text-sm">
                                            You need to lead a team to register for this event. 
                                            <Link to="/teams" onClick={onClose} className="text-accent underline ml-2">Create a Team</Link>
                                        </div>
                                    ) : (
                                        <select
                                            value={selectedTeamId}
                                            onChange={(e) => setSelectedTeamId(e.target.value)}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-accent outline-none"
                                        >
                                            {myTeams.map(team => (
                                                <option key={team.id} value={team.id}>{team.name}</option>
                                            ))}
                                        </select>
                                    )}
                                    <p className="text-xs text-gray-500">Only teams where you are the leader are shown.</p>
                                </div>
                            ) : (
                                <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-800 mb-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <FaUsers className="text-blue-400" />
                                        <span className="text-white font-medium">Individual Participation</span>
                                    </div>
                                    <p className="text-sm text-gray-400">You are registering as an individual participant.</p>
                                </div>
                            )}

                            <button
                                onClick={handleRegister}
                                disabled={loading || (segment.isTeamSegment && myTeams.length === 0)}
                                className="w-full bg-accent text-black font-bold py-3 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Processing..." : "Confirm Registration"}
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 text-3xl">
                                <FaCheckCircle />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
                            <p className="text-gray-400 mb-8">
                                You have successfully registered for {segment.name}.
                            </p>
                            <button
                                onClick={onClose}
                                className="bg-zinc-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-zinc-700 w-full"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
