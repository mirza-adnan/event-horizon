import { useState, useEffect, useRef } from "react";
import { FaEllipsisV, FaLink, FaShareAlt, FaUsers, FaSpinner, FaCheck } from "react-icons/fa";

interface EventActionMenuProps {
    eventTitle: string;
    eventLink: string;
}

interface Team {
    id: string;
    name: string;
}

export default function EventActionMenu({ eventTitle, eventLink }: EventActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showShareSubmenu, setShowShareSubmenu] = useState(false);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [sharingToTeam, setSharingToTeam] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setShowShareSubmenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchTeams = async () => {
        if (teams.length > 0) return;
        setLoadingTeams(true);
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
            setLoadingTeams(false);
        }
    };

    const handleCopyLink = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        navigator.clipboard.writeText(eventLink);
        setCopySuccess(true);
        setTimeout(() => {
            setCopySuccess(false);
            setIsOpen(false);
        }, 1500);
    };

    const handleShareToTeam = async (e: React.MouseEvent, teamId: string) => {
        e.stopPropagation();
        e.preventDefault();
        setSharingToTeam(teamId);
        try {
            const message = `Hey team, check out this event: ${eventTitle} - ${eventLink}`;
            const res = await fetch(`http://localhost:5050/api/teams/${teamId}/chats`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
                credentials: "include"
            });
            if (res.ok) {
                // Potential toast notification here
                setIsOpen(false);
                setShowShareSubmenu(false);
            }
        } catch (error) {
            console.error("Failed to share with team", error);
        } finally {
            setSharingToTeam(null);
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsOpen(!isOpen);
                }}
                className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
                title="Event Actions"
            >
                <FaEllipsisV size={14} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {!showShareSubmenu ? (
                        <>
                            <button
                                onClick={handleCopyLink}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                            >
                                {copySuccess ? <FaCheck className="text-green-500" /> : <FaLink />}
                                <span>{copySuccess ? "Copied!" : "Copy Link"}</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setShowShareSubmenu(true);
                                    fetchTeams();
                                }}
                                className="w-full flex items-center justify-between px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <FaShareAlt />
                                    <span>Share to Team</span>
                                </div>
                                <span className="text-[10px] text-zinc-500">→</span>
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col">
                            <div className="px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowShareSubmenu(false);
                                    }}
                                    className="text-zinc-500 hover:text-white p-1"
                                >
                                    ←
                                </button>
                                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Select Team</span>
                            </div>
                            <div className="max-h-48 overflow-y-auto pt-1">
                                {loadingTeams ? (
                                    <div className="px-4 py-3 flex justify-center">
                                        <FaSpinner className="animate-spin text-accent text-xs" />
                                    </div>
                                ) : teams.length === 0 ? (
                                    <div className="px-4 py-3 text-[10px] text-zinc-600 italic">No teams joined</div>
                                ) : (
                                    teams.map((team) => (
                                        <button
                                            key={team.id}
                                            onClick={(e) => handleShareToTeam(e, team.id)}
                                            disabled={sharingToTeam === team.id}
                                            className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-accent/10 hover:text-accent transition-colors flex items-center gap-2"
                                        >
                                            <FaUsers size={12} />
                                            <span className="truncate">{team.name}</span>
                                            {sharingToTeam === team.id && <FaSpinner className="animate-spin ml-auto text-[10px]" />}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
