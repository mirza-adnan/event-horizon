import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaCalendarAlt, FaStar, FaUser, FaEnvelope, FaClock, FaUserPlus } from "react-icons/fa";
import { useUserAuth } from "../hooks/useUserAuth";
import InviteToTeamModal from "../components/InviteToTeamModal";

interface Event {
    id: string;
    title: string;
    bannerUrl?: string;
    startDate: string;
    city: string;
    isOnline: boolean;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
    skills?: string;
    createdAt: string;
}

export default function UserProfile() {
    const { id } = useParams();
    const [data, setData] = useState<{
        user: User;
        upcomingEvents: Event[];
        pastEvents: Event[];
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const { user: currentUser, isAuthenticated } = useUserAuth();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`http://localhost:5050/api/users/profile/${id}`);
                if (res.ok) {
                    const profileData = await res.json();
                    setData(profileData);
                }
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-bgr">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-bgr p-8">
                <h1 className="text-3xl font-bold text-white mb-4">User not found</h1>
                <Link to="/explore" className="text-accent hover:underline">Back to Explore</Link>
            </div>
        );
    }

    const { user, upcomingEvents, pastEvents } = data;

    return (
        <div className="flex-1 bg-bgr min-h-screen">
            {/* Header / Hero */}
            <div className="relative h-64 bg-zinc-900 border-b border-zinc-800">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                <div className="max-w-6xl mx-auto px-8 h-full flex items-end pb-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-zinc-800 border-4 border-zinc-900 flex items-center justify-center text-4xl font-bold text-zinc-500 overflow-hidden shadow-2xl">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.firstName} className="w-full h-full object-cover" />
                            ) : (
                                <FaUser />
                            )}
                        </div>
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                            <div className="flex flex-col">
                                <h1 className="text-4xl font-bold text-white mb-2">
                                    {user.firstName} {user.lastName}
                                </h1>
                                <div className="flex items-center gap-4 text-zinc-400 text-sm">
                                    <div className="flex items-center gap-2">
                                        <FaEnvelope className="text-accent" />
                                        <span>{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaClock className="text-accent" />
                                        <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                {/* Edit Profile Button */}
                                {isAuthenticated && currentUser?.id === user.id && (
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="flex items-center gap-2 bg-zinc-800 text-white px-6 py-3 rounded-2xl font-bold hover:bg-zinc-700 transition-all border border-zinc-700"
                                    >
                                        Edit Profile
                                    </button>
                                )}

                                {/* Invite Button */}
                                {isAuthenticated && currentUser?.id !== user.id && (
                                    <button
                                        onClick={() => setShowInviteModal(true)}
                                        className="flex items-center gap-2 bg-accent text-black px-6 py-3 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20"
                                    >
                                        <FaUserPlus />
                                        Invite to Team
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Bio & Skills Section */}
                    <div className="lg:col-span-1 space-y-8">
                        <section className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-8">
                            <h2 className="text-xl font-bold text-white mb-4">About</h2>
                            <p className="text-zinc-400 whitespace-pre-wrap">
                                {user.bio || "No bio yet."}
                            </p>
                        </section>

                        <section className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-8">
                            <h2 className="text-xl font-bold text-white mb-4">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {user.skills ? user.skills.split(',').map((skill, i) => (
                                    <span key={i} className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-sm border border-zinc-700">
                                        {skill.trim()}
                                    </span>
                                )) : (
                                    <span className="text-zinc-500 italic text-sm">No skills added.</span>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Events Sections */}
                    <div className="lg:col-span-2 space-y-16">
                        {/* Upcoming Registrations */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                <FaCalendarAlt className="text-accent" />
                                Upcoming Registered Events
                            </h2>
                            
                            {upcomingEvents.length === 0 ? (
                                <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-12 text-center text-zinc-500">
                                    No upcoming registrations.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {upcomingEvents.map((event) => (
                                        <Link 
                                            key={event.id}
                                            to={`/events/${event.id}`}
                                            className="group bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-accent/20 transition-all duration-300"
                                        >
                                            {event.bannerUrl && (
                                                <img src={`http://localhost:5050${event.bannerUrl}`} alt={event.title} className="w-full h-32 object-cover" />
                                            )}
                                            <div className="p-4">
                                                <h3 className="font-bold text-white group-hover:text-accent transition-colors mb-2 line-clamp-1">{event.title}</h3>
                                                <div className="text-xs text-zinc-500 space-y-1">
                                                    <p>{new Date(event.startDate).toLocaleDateString()}</p>
                                                    <p>{event.isOnline ? "Online" : event.city}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Past Events */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                <FaStar className="text-accent" />
                                Participation History
                            </h2>

                            {pastEvents.length === 0 ? (
                                <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-12 text-center text-zinc-500">
                                    No past events.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {pastEvents.map((event) => (
                                        <Link 
                                            key={event.id}
                                            to={`/events/${event.id}`}
                                            className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-900"
                                        >
                                            {event.bannerUrl ? (
                                                <img 
                                                    src={`http://localhost:5050${event.bannerUrl}`} 
                                                    alt={event.title}
                                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                                    <FaCalendarAlt size={24} />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex flex-col justify-end">
                                                <h3 className="text-white text-[10px] font-bold line-clamp-2">{event.title}</h3>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
            {showInviteModal && (
                <InviteToTeamModal 
                    invitedUserId={user.id} 
                    invitedUserName={`${user.firstName} ${user.lastName}`}
                    onClose={() => setShowInviteModal(false)}
                />
            )}
            {showEditModal && (
                <EditProfileModal 
                    user={user}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={(updatedUser) => {
                        setData(prev => prev ? { ...prev, user: { ...prev.user, ...updatedUser } } : null);
                    }}
                />
            )}
        </div>
    );
}

function EditProfileModal({ user, onClose, onUpdate }: { user: User, onClose: () => void, onUpdate: (u: Partial<User>) => void }) {
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName || "");
    const [bio, setBio] = useState(user.bio || "");
    const [skills, setSkills] = useState(user.skills || "");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("http://localhost:5050/api/users/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ firstName, lastName, bio, skills }),
            });

            if (res.ok) {
                onUpdate({ firstName, lastName, bio, skills });
                onClose();
            } else {
                const error = await res.json();
                alert(error.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Update profile failed:", error);
            alert("External error updating profile");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">First Name</label>
                                <input 
                                    type="text" 
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Last Name</label>
                                <input 
                                    type="text" 
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Bio</label>
                            <textarea 
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent min-h-[100px]"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Skills (comma separated)</label>
                            <input 
                                type="text" 
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                                placeholder="React, Node.js, Design..."
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="flex-1 px-6 py-3 rounded-xl font-bold text-black bg-accent hover:bg-accent/90 transition-colors disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
