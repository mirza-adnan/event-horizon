import { FaShieldAlt, FaTrashAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

interface Member {
    userId: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    avatarUrl?: string;
    role: string;
    joinedAt: string;
}

interface TeamMembersProps {
    teamId: string;
    members: Member[];
    myRole: string; // 'leader' | 'member'
    onMemberRemoved?: () => void;
}

export default function TeamMembers({ teamId, members, myRole, onMemberRemoved }: TeamMembersProps) {
    const isLeader = myRole === 'leader'; 

    const handleRemove = async (userId: string) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;
        
        try {
            const res = await fetch(`http://localhost:5050/api/teams/${teamId}/members/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (res.ok) {
                onMemberRemoved?.();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to remove member");
            }
        } catch (err) {
            alert("Error removing member");
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Team Members ({members.length})</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((member) => (
                    <div key={member.userId} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700">
                                {member.avatarUrl ? (
                                    <img src={member.avatarUrl} alt={member.firstName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-400 font-bold">{member.firstName.charAt(0)}</span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <Link to={`/user/${member.userId}`} className="text-white font-medium hover:text-accent transition-colors">
                                        {member.firstName} {member.lastName}
                                    </Link>
                                    {member.role === 'leader' && (
                                        <FaShieldAlt className="text-purple-400 text-xs" title="Leader" />
                                    )}
                                </div>
                                <p className="text-zinc-500 text-xs">{member.email}</p>
                            </div>
                        </div>

                        {/* Leader Actions */}
                        {isLeader && member.role !== 'leader' && (
                            <button 
                                onClick={() => handleRemove(member.userId)}
                                className="text-zinc-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity" 
                                title="Remove Member"
                            >
                                <FaTrashAlt />
                            </button>
                        )}
                    </div>
                ))}
            </div>
            
            {/* Invite Section (Placeholder) */}
            {/* 
            {isLeader && (
                <div className="mt-8 pt-8 border-t border-zinc-800">
                    <h3 className="text-lg font-bold text-white mb-4">Invite New Members</h3>
                    <div className="flex gap-2 max-w-md">
                        <input 
                            type="email" 
                            placeholder="Enter email address" 
                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-accent outline-none"
                        />
                        <button className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200">
                            Invite
                        </button>
                    </div>
                </div>
            )}
            */}
        </div>
    );
}
