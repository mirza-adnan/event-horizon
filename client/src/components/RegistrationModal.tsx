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
    const [registrationCode, setRegistrationCode] = useState("");
    const requiresCode = segment.id && event.constraints?.some((c: any) => c.type === "code" && (c.includedSegments.includes("all") || c.includedSegments.includes(segment.id)));
    
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

    // Mock Payment Step
    const [isPaymentStep, setIsPaymentStep] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [tempRegId, setTempRegId] = useState<string | null>(null);

    const handleRegister = async () => {
        setLoading(true);
        setError(null);

        const body: any = {
            eventId: event.id,
            segmentId: segment.id,
            data: {
                ...(requiresCode ? { code: registrationCode } : {})
            }
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
            // 1. Create Registration (unpaid)
            const res = await fetch("http://localhost:5050/api/registrations/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                credentials: "include"
            });

            if (res.ok) {
                const data = await res.json();
                
                // Check if payment is needed
                if (segment.registrationFee && segment.registrationFee > 0) {
                    setTempRegId(data.registration.id);
                    setIsPaymentStep(true);
                    setLoading(false);
                } else {
                    setStep(2); // Success (Free)
                    setLoading(false);
                }
            } else {
                const data = await res.json();
                setError(data.message || "Registration failed");
                setLoading(false);
            }
        } catch (err) {
            setError("Network error occurred");
            setLoading(false);
        }
    };

    const handleMockPayment = async () => {
        if (!tempRegId) return;
        setPaymentProcessing(true);

        // Simulate delay
        setTimeout(async () => {
            try {
                const res = await fetch(`http://localhost:5050/api/registrations/${tempRegId}/pay-mock`, {
                    method: "POST",
                    credentials: "include"
                });

                if (res.ok) {
                    setStep(2); // Success
                    setIsPaymentStep(false);
                } else {
                    setError("Payment failed. Please try again.");
                }
            } catch (err) {
                setError("Payment network error.");
            } finally {
                setPaymentProcessing(false);
            }
        }, 2000);
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
                    {step === 1 && !isPaymentStep ? (
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

                            {/* Registration Code Input */}
                            {requiresCode && (
                                <div className="space-y-2 mb-8">
                                    <label className="block text-sm font-medium text-gray-300">Registration Code</label>
                                    <input
                                        type="text"
                                        value={registrationCode}
                                        onChange={(e) => setRegistrationCode(e.target.value)}
                                        placeholder="Enter the required registration code"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-accent outline-none"
                                    />
                                    <p className="text-xs text-gray-500">This event or segment requires a secret code to register.</p>
                                </div>
                            )}

                            {/* Fee Display */}
                            {segment.registrationFee > 0 && (
                                <div className="mb-8 p-4 bg-accent/10 border border-accent/20 rounded-lg flex justify-between items-center">
                                    <span className="text-gray-300">Registration Fee</span>
                                    <span className="text-xl font-bold text-accent">৳{segment.registrationFee}</span>
                                </div>
                            )}

                            <button
                                onClick={handleRegister}
                                disabled={loading || (segment.isTeamSegment && myTeams.length === 0)}
                                className="w-full bg-accent text-black font-bold py-3 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Processing..." : (segment.registrationFee > 0 ? "Proceed to Payment" : "Confirm Registration")}
                            </button>
                        </>
                    ) : isPaymentStep ? (
                        <>
                            <h2 className="text-2xl font-bold text-white mb-2">Payment Required</h2>
                            <p className="text-gray-400 mb-6">
                                Please pay <span className="text-accent font-bold">৳{segment.registrationFee}</span> to complete your registration.
                            </p>

                            {/* Mock Payment Gateway UI */}
                            <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 mb-8 text-center">
                                {paymentProcessing ? (
                                    <div className="py-8">
                                        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-white font-medium animate-pulse">Processing Payment...</p>
                                        <p className="text-xs text-gray-500 mt-2">Connecting to secure gateway</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-3 bg-zinc-900 rounded border border-zinc-700 cursor-pointer hover:border-accent transition-colors">
                                            <p className="text-white font-bold">bKash / Nagad / Card</p>
                                            <p className="text-xs text-gray-500">Secure Payment Gateway</p>
                                        </div>
                                        <button
                                            onClick={handleMockPayment}
                                            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-500 transition-colors shadow-lg shadow-green-900/20"
                                        >
                                            Pay Now
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 text-3xl">
                                <FaCheckCircle />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
                            <p className="text-gray-400 mb-8">
                                {segment.registrationFee > 0 ? "Payment received. " : ""}You have successfully registered for {segment.name}.
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
