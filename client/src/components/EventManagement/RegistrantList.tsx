import { useState, useEffect } from "react";
import { FaUser, FaUsers, FaSearch, FaSpinner, FaPlay, FaPause, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { cn } from "../../utils/helpers";

interface TeamMember {
    userId: string;
    userName: string;
    userEmail: string;
    role: string;
}

interface Registration {
    id: string;
    status: string;
    paymentStatus: string;
    segmentName?: string;
    userName?: string;
    userEmail?: string;
    teamName?: string;
    teamLeader?: string;
    segmentId?: string;
    userId?: string;
    teamId?: string;
    teamMembers?: TeamMember[];
}

interface RegistrantListProps {
    eventId: string;
    segmentId: string | null;
    isPaused?: boolean;
    onTogglePause?: () => void;
}

export default function RegistrantList({ eventId, segmentId, isPaused: initialPaused, onTogglePause }: RegistrantListProps) {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
    const [isPaused, setIsPaused] = useState(initialPaused || false);

    useEffect(() => {
        setIsPaused(initialPaused || false);
    }, [initialPaused]);

    useEffect(() => {
        fetchRegistrations();
    }, [eventId]);

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5050/api/registrations/event/${eventId}`, {
                 credentials: "include"
            });
            const data = await res.json();
            if (res.ok) {
                setRegistrations(data.registrations);
            }
        } catch (err) {
            console.error("Failed to fetch registrations", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePause = async () => {
        if (!segmentId) return;
        try {
            const res = await fetch(`http://localhost:5050/api/registrations/segments/${segmentId}/toggle-pause`, {
                method: "PATCH",
                credentials: "include"
            });
            const data = await res.json();
            if (res.ok) {
                setIsPaused(data.isRegistrationPaused);
                if (onTogglePause) onTogglePause();
            }
        } catch (err) {
            console.error("Failed to toggle pause", err);
        }
    };

    const toggleTeam = (teamId: string) => {
        const newExpanded = new Set(expandedTeams);
        if (newExpanded.has(teamId)) {
            newExpanded.delete(teamId);
        } else {
            newExpanded.add(teamId);
        }
        setExpandedTeams(newExpanded);
    };

    // Filter Logic
    const filteredRegistrations = registrations.filter(reg => {
        if (segmentId && reg.segmentId !== segmentId) {
             return false;
        }

        // Search Filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (
                reg.userName?.toLowerCase().includes(term) ||
                reg.teamName?.toLowerCase().includes(term) ||
                reg.userEmail?.toLowerCase().includes(term)
            );
        }

        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        {segmentId ? 'Segment Registrants' : 'All Registrants'} 
                        <span className="text-sm font-normal text-zinc-500">
                            ({filteredRegistrations.length} Registrations)
                        </span>
                        {segmentId && (
                            <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full font-medium border",
                                isPaused ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-green-500/10 text-green-400 border-green-500/20"
                            )}>
                                {isPaused ? "Paused" : "Live"}
                            </span>
                        )}
                    </h2>
                 </div>
                 
                 <div className="flex items-center gap-4">
                    {segmentId && (
                        <button
                            onClick={handleTogglePause}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
                                isPaused 
                                    ? "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20" 
                                    : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                            )}
                        >
                            {isPaused ? <><FaPlay size={12} /> Start Registration</> : <><FaPause size={12} /> Pause Registration</>}
                        </button>
                    )}
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-zinc-500" />
                        <input 
                            type="text" 
                            placeholder="Search registrants..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                        />
                    </div>
                 </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-accent text-2xl" /></div>
            ) : filteredRegistrations.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl text-zinc-500">
                    No registrations found.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-800">
                    <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="bg-zinc-900 text-zinc-200 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4 w-10"></th>
                                <th className="px-6 py-4">Registrant</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Status</th>
                                {!segmentId && <th className="px-6 py-4">Segment</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredRegistrations.map(reg => (
                                <>
                                    <tr key={reg.id} className="hover:bg-zinc-900/50 transition-colors">
                                        <td className="px-6 py-4">
                                            {reg.teamId && (
                                                <button 
                                                    onClick={() => toggleTeam(reg.teamId!)}
                                                    className="p-1 hover:bg-zinc-800 rounded transition-colors"
                                                >
                                                    {expandedTeams.has(reg.teamId) ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {reg.teamId ? (
                                                <div className="flex items-center gap-3">
                                                     <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center font-bold">
                                                         {reg.teamName?.charAt(0)}
                                                     </div>
                                                     <div>
                                                         <div className="font-medium text-white underline cursor-pointer hover:text-accent transition-colors" onClick={() => toggleTeam(reg.teamId!)}>{reg.teamName}</div>
                                                         <div className="text-xs">Team</div>
                                                     </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                     <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold">
                                                         {reg.userName?.charAt(0)}
                                                     </div>
                                                     <div>
                                                         <div className="font-medium text-white">{reg.userName}</div>
                                                         <div className="text-xs">{reg.userEmail}</div>
                                                     </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {reg.teamId ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                    <FaUsers size={10} /> Team
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                    <FaUser size={10} /> Individual
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                                                reg.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                reg.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                                {reg.status}
                                            </span>
                                        </td>
                                        {!segmentId && <td className="px-6 py-4 text-zinc-500">{reg.segmentName || "Main Event"}</td>}
                                    </tr>
                                    {reg.teamId && expandedTeams.has(reg.teamId) && (
                                        <tr>
                                            <td colSpan={!segmentId ? 5 : 4} className="px-12 py-4 bg-zinc-900/30">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {reg.teamMembers && reg.teamMembers.length > 0 ? reg.teamMembers.map(member => (
                                                        <div key={member.userId} className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                                                            <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center font-medium">
                                                                {member.userName.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-white flex items-center gap-2">
                                                                    {member.userName}
                                                                    {member.role === 'leader' && (
                                                                        <span className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent border border-accent/20 rounded uppercase">Leader</span>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-zinc-500">{member.userEmail}</div>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="col-span-full text-xs text-zinc-600 italic">No member information available.</div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
