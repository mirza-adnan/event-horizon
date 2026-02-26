import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTimes, FaSpinner, FaUsers, FaPlus } from "react-icons/fa";

interface Team {
    id: string;
    name: string;
    myRole: string;
    userStatus?: "member" | "pending" | null;
}

interface InviteToTeamModalProps {
    invitedUserId: string;
    invitedUserName: string;
    onClose: () => void;
}

export default function InviteToTeamModal({ invitedUserId, invitedUserName, onClose }: InviteToTeamModalProps) {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [invitingTeamId, setInvitingTeamId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        const fetchMyTeams = async () => {
            try {
                const res = await fetch(`http://localhost:5050/api/teams/my?forUserId=${invitedUserId}`, {
                    credentials: "include"
                });
                if (res.ok) {
                    const data = await res.json();
                    // Only show teams where user is leader
                    setTeams(data.teams.filter((t: Team) => t.myRole === "leader"));
                }
            } catch (error) {
                console.error("Failed to fetch teams:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyTeams();
    }, [invitedUserId]);

    const handleInvite = async (teamId: string) => {
        setInvitingTeamId(teamId);
        setMessage(null);
        try {
            const res = await fetch(`http://localhost:5050/api/teams/${teamId}/invite`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: invitedUserId }),
                credentials: "include"
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: "success", text: "Invite sent successfully!" });
                // Update local state to reflect the pending status
                setTeams(prev => prev.map(t => t.id === teamId ? { ...t, userStatus: "pending" as const } : t));
            } else {
                setMessage({ type: "error", text: data.message || "Failed to send invite" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Something went wrong" });
        } finally {
            setInvitingTeamId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                    <div className="text-left">
                        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                            <FaUsers className="text-accent" />
                            Invite to Team
                        </h2>
                        <p className="text-zinc-500 text-xs text-left">Invite <span className="text-zinc-300 font-semibold">{invitedUserName}</span> to join your team</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {message && (
                        <div className={`mb-6 p-4 rounded-2xl text-sm font-medium flex items-center gap-3 ${
                            message.type === "success" 
                                ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                            {message.text}
                        </div>
                    )}

                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center">
                            <FaSpinner className="animate-spin text-accent text-3xl mb-4" />
                            <p className="text-zinc-500 text-sm">Loading your teams...</p>
                        </div>
                    ) : teams.length === 0 ? (
                        <div className="py-12 text-center bg-zinc-800/20 rounded-2xl border border-zinc-800/50">
                            <p className="text-zinc-400 mb-4 px-6">You don't lead any teams yet. Create a team first to invite others!</p>
                            <Link 
                                to="/teams" 
                                className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-full text-sm font-bold transition-all"
                                onClick={onClose}
                            >
                                <FaPlus size={12} />
                                Create a Team
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                            {teams.map(team => (
                                <div 
                                    key={team.id}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-zinc-800/30 border border-zinc-800 hover:border-zinc-700 transition-all group"
                                >
                                    <div className="text-left">
                                        <h3 className="font-bold text-white text-sm group-hover:text-accent transition-colors">{team.name}</h3>
                                        {team.userStatus === 'member' ? (
                                            <span className="text-[10px] text-green-500 uppercase tracking-wider font-bold">Already a Member</span>
                                        ) : team.userStatus === 'pending' ? (
                                            <span className="text-[10px] text-yellow-500 uppercase tracking-wider font-bold">Invite Pending</span>
                                        ) : (
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Team Lead</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleInvite(team.id)}
                                        disabled={invitingTeamId !== null || !!team.userStatus}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                            invitingTeamId === team.id || !!team.userStatus
                                                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                                : "bg-accent text-black hover:scale-105 active:scale-95 shadow-lg shadow-accent/10"
                                        }`}
                                    >
                                        {invitingTeamId === team.id ? (
                                            <FaSpinner className="animate-spin" />
                                        ) : team.userStatus === 'member' ? (
                                            "Member"
                                        ) : team.userStatus === 'pending' ? (
                                            "Pending"
                                        ) : (
                                            "Send Invite"
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 text-center">
                    <button 
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white text-sm font-medium transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
}
