import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaUsers, FaUserPlus, FaTimes, FaSpinner } from "react-icons/fa";
import { cn } from "../utils/helpers";

interface Team {
    id: string;
    name: string;
    description: string;
    role: string;
    myRole: string; // 'leader' | 'member'
    _count?: {
        members: number;
    }
}

interface Invite {
    id: string;
    status: string;
    createdAt: string;
    team: {
        id: string;
        name: string;
    };
    inviter: {
        firstName: string;
        lastName: string;
    };
}

export default function Teams() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Create Team Form State
    const [teamName, setTeamName] = useState("");
    const [teamDesc, setTeamDesc] = useState("");
    const [inviteEmails, setInviteEmails] = useState<string[]>([]);
    const [currentEmail, setCurrentEmail] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchTeams();
        fetchInvites();
    }, []);

    const fetchTeams = async () => {
        try {
            const res = await fetch("http://localhost:5050/api/teams/my", {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setTeams(data.teams);
            }
        } catch (error) {
            console.error("Failed to fetch teams", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInvites = async () => {
        try {
            const res = await fetch("http://localhost:5050/api/teams/invites", {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setInvites(data.invites);
            }
        } catch (error) {
            console.error("Failed to fetch invites", error);
        }
    };

    const handleInviteResponse = async (inviteId: string, action: 'accept' | 'reject') => {
        try {
            const res = await fetch(`http://localhost:5050/api/teams/invites/${inviteId}/respond`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
                credentials: "include"
            });
            if (res.ok) {
                fetchInvites();
                if (action === 'accept') fetchTeams();
            }
        } catch (error) {
            console.error("Failed to respond to invite", error);
        }
    };

    const handleAddEmail = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && currentEmail.trim()) {
            e.preventDefault();
            if (inviteEmails.includes(currentEmail.trim())) return;
            setInviteEmails([...inviteEmails, currentEmail.trim()]);
            setCurrentEmail("");
        }
    };

    const removeEmail = (email: string) => {
        setInviteEmails(inviteEmails.filter(e => e !== email));
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        try {
            const res = await fetch("http://localhost:5050/api/teams/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: teamName,
                    description: teamDesc,
                    memberEmails: inviteEmails
                }),
                credentials: "include"
            });

            if (res.ok) {
                setIsCreateModalOpen(false);
                setTeamName("");
                setTeamDesc("");
                setInviteEmails([]);
                fetchTeams(); // Refresh list
            }
        } catch (error) {
            console.error("Create team error", error);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Teams</h1>
                    <p className="text-gray-400">Manage your squads and collaborations</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-accent text-black px-6 py-3 rounded-xl font-medium hover:bg-accent/90 transition-colors"
                >
                    <FaPlus />
                    <span>Create Team</span>
                </button>
            </div>

            {/* Invitations Section */}
            {invites.length > 0 && (
                <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <FaUserPlus className="text-accent" />
                        Pending Invitations
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {invites.map((invite) => (
                            <div 
                                key={invite.id}
                                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-3">
                                    <div className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                        Invitation
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1 tracking-tight">{invite.team.name}</h3>
                                <p className="text-zinc-500 text-sm mb-6">
                                    Invited by <span className="text-zinc-300 font-medium">{invite.inviter.firstName} {invite.inviter.lastName}</span>
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleInviteResponse(invite.id, 'accept')}
                                        className="flex-1 bg-accent text-black font-bold py-2 rounded-xl text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/10"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleInviteResponse(invite.id, 'reject')}
                                        className="flex-1 bg-zinc-800 text-zinc-400 font-bold py-2 rounded-xl text-sm hover:bg-zinc-700 hover:text-white transition-all"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <FaSpinner className="animate-spin text-accent text-3xl" />
                </div>
            ) : teams.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                    <FaUsers className="text-6xl text-zinc-700 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">No teams yet</h2>
                    <p className="text-gray-400 max-w-md mx-auto mb-6">
                        Create a team to collaborate with others on hackathons and projects.
                    </p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="text-accent hover:underline"
                    >
                        Create your first team
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => (
                        <Link
                            key={team.id}
                            to={`/teams/${team.id}`}
                            className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-accent transition-colors group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-xl font-bold text-white">
                                    {team.name.charAt(0)}
                                </div>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-medium",
                                    team.myRole === 'leader' ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
                                )}>
                                    {team.myRole === 'leader' ? 'Leader' : 'Member'}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                                {team.name}
                            </h3>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                {team.description || "No description provided."}
                            </p>
                            <div className="flex items-center text-zinc-500 text-sm">
                                <FaUsers className="mr-2" />
                                <span>View Team Room</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Create Team Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 w-full max-w-lg rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Create New Team</h2>
                            <button 
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateTeam} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Team Name
                                </label>
                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-accent outline-none"
                                    placeholder="e.g. Code Ninjas"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={teamDesc}
                                    onChange={(e) => setTeamDesc(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-accent outline-none min-h-[100px]"
                                    placeholder="What's this team about?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Invite Members (Email)
                                </label>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            value={currentEmail}
                                            onChange={(e) => setCurrentEmail(e.target.value)}
                                            onKeyDown={handleAddEmail}
                                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-accent outline-none"
                                            placeholder="Enter email and press Enter"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (currentEmail.trim() && !inviteEmails.includes(currentEmail.trim())) {
                                                    setInviteEmails([...inviteEmails, currentEmail.trim()]);
                                                    setCurrentEmail("");
                                                }
                                            }}
                                            className="bg-zinc-800 text-white px-4 rounded-lg hover:bg-zinc-700"
                                        >
                                            <FaUserPlus />
                                        </button>
                                    </div>
                                    
                                    {inviteEmails.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {inviteEmails.map(email => (
                                                <div key={email} className="bg-zinc-800 text-sm px-3 py-1 rounded-full flex items-center gap-2">
                                                    <span className="text-gray-300">{email}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeEmail(email)}
                                                        className="text-gray-500 hover:text-red-400"
                                                    >
                                                        <FaTimes size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full bg-accent text-black font-bold py-3 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                            >
                                {creating ? "Creating..." : "Create Team"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
