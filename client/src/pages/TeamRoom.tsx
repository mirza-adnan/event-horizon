import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaComments, FaUsers, FaCalendarAlt, FaSpinner } from "react-icons/fa";
import { cn } from "../utils/helpers";
import TeamChat from "../components/TeamRoom/TeamChat";
import TeamMembers from "../components/TeamRoom/TeamMembers";
import TeamEvents from "../components/TeamRoom/TeamEvents";

export default function TeamRoom() {
    const { teamId } = useParams();
    const [activeTab, setActiveTab] = useState("chat");
    const [team, setTeam] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [teamEvents, setTeamEvents] = useState<any[]>([]);
    const [myRole, setMyRole] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchTeamDetails();
        fetchEvents();
    }, [teamId]);

    const fetchTeamDetails = async () => {
        try {
            const res = await fetch(`http://localhost:5050/api/teams/${teamId}`, {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setTeam(data.team);
                setMembers(data.members);
                setMyRole(data.myRole);
            } else {
                setError("Failed to load team details");
            }
        } catch (err) {
            setError("Error loading team");
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            const res = await fetch(`http://localhost:5050/api/teams/${teamId}/events`, {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setTeamEvents(data.events);
            }
        } catch (err) {
            console.error("Error fetching events", err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[500px]">
                <FaSpinner className="animate-spin text-accent text-3xl" />
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="text-center py-20">
                <p className="text-red-400">{error || "Team not found"}</p>
                <Link to="/teams" className="text-accent underline mt-4 block">Back to Teams</Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen max-h-screen overflow-hidden">
            {/* Header */}
            <div className="bg-zinc-900 border-b border-zinc-800 p-6 flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-white">{team.name}</h1>
                    <p className="text-gray-400 text-sm">Team Room</p>
                </div>
                <div className="flex gap-2">
                    {/* Invite Member Button (Leader Only) - implemented in Members tab or here? */}
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-zinc-900 border-b border-zinc-800 px-6 shrink-0">
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab("chat")}
                        className={cn(
                            "py-4 flex items-center gap-2 border-b-2 transition-colors",
                            activeTab === "chat" ? "border-accent text-white" : "border-transparent text-gray-400 hover:text-gray-200"
                        )}
                    >
                        <FaComments /> Chat
                    </button>
                    <button
                        onClick={() => setActiveTab("members")}
                        className={cn(
                            "py-4 flex items-center gap-2 border-b-2 transition-colors",
                            activeTab === "members" ? "border-accent text-white" : "border-transparent text-gray-400 hover:text-gray-200"
                        )}
                    >
                        <FaUsers /> Members
                    </button>
                    <button
                         onClick={() => setActiveTab("events")}
                        className={cn(
                            "py-4 flex items-center gap-2 border-b-2 transition-colors",
                            activeTab === "events" ? "border-accent text-white" : "border-transparent text-gray-400 hover:text-gray-200"
                        )}
                    >
                        <FaCalendarAlt /> Events
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden bg-zinc-950 relative">
                 {activeTab === "chat" && (
                    <TeamChat teamId={teamId!} myRole={myRole} />
                 )}
                 {activeTab === "members" && (
                     <div className="h-full overflow-y-auto p-6">
                        <TeamMembers 
                            teamId={teamId!}
                            members={members} 
                            myRole={myRole} 
                            onMemberRemoved={() => {
                                fetchTeamDetails();
                                fetchEvents();
                            }} 
                        />
                     </div>
                 )}
                 {activeTab === "events" && (
                     <div className="h-full overflow-y-auto p-6">
                         <TeamEvents events={teamEvents} />
                     </div>
                 )}
            </div>
        </div>
    );
}
