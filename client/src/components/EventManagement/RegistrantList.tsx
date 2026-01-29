import { useState, useEffect } from "react";
import { FaUser, FaUsers, FaSearch, FaSpinner } from "react-icons/fa";

interface Registration {
    id: string;
    status: string;
    paymentStatus: string;
    segmentName?: string;
    userName?: string;
    userEmail?: string;
    teamName?: string;
    teamLeader?: string;
    segmentId?: string; // Need this for filtering
    userId?: string;
    teamId?: string;
}

interface RegistrantListProps {
    eventId: string;
    segmentId: string | null;
}

export default function RegistrantList({ eventId, segmentId }: RegistrantListProps) {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

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

    // Filter Logic
    const filteredRegistrations = registrations.filter(reg => {
        // Filter by Segment
        // If segmentId is null (Global), show ALL registrations for the event?
        // Or only those registered for "Entire Event" (if possible)?
        // Usually Global View shows everyone.
        
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
                 <h2 className="text-xl font-bold text-white">
                     {segmentId ? 'Segment Registrants' : 'All Registrants'} 
                     <span className="ml-2 text-sm font-normal text-zinc-500">
                         ({filteredRegistrations.length})
                     </span>
                 </h2>
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
                                <th className="px-6 py-4">Registrant</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Payment</th>
                                {!segmentId && <th className="px-6 py-4">Segment</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredRegistrations.map(reg => (
                                <tr key={reg.id} className="hover:bg-zinc-900/50 transition-colors">
                                    <td className="px-6 py-4">
                                        {reg.userName ? (
                                            <div className="flex items-center gap-3">
                                                 <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold">
                                                     {reg.userName.charAt(0)}
                                                 </div>
                                                 <div>
                                                     <div className="font-medium text-white">{reg.userName}</div>
                                                     <div className="text-xs">{reg.userEmail}</div>
                                                 </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                 <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center font-bold">
                                                     {reg.teamName?.charAt(0)}
                                                 </div>
                                                 <div>
                                                     <div className="font-medium text-white">{reg.teamName}</div>
                                                     <div className="text-xs">Team</div>
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
                                    <td className="px-6 py-4">
                                         <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                                            reg.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            'bg-zinc-800 text-zinc-400 border-zinc-700'
                                        }`}>
                                            {reg.paymentStatus || 'Unpaid'}
                                        </span>
                                    </td>
                                    {!segmentId && <td className="px-6 py-4 text-zinc-500">{reg.segmentName || "Main Event"}</td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
