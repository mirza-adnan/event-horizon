import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaCompass, FaUsers, FaSignOutAlt, FaUser, FaBell } from "react-icons/fa";
import { cn } from "../utils/helpers";

interface UserSidebarProps {
    user: any;
    onLogout: () => void;
}

export default function UserSidebar({ user, onLogout }: UserSidebarProps) {
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const res = await fetch("http://localhost:5050/api/notifications/unread-count", {
                    credentials: "include"
                });
                if (res.ok) {
                    const data = await res.json();
                    setUnreadCount(data.count);
                }
            } catch (error) {
                console.error("Failed to fetch unread count:", error);
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const menuItems = [
        { icon: FaCompass, label: "Explore", path: "/explore" },
        { icon: FaUsers, label: "Teams", path: "/teams" },
        { icon: FaBell, label: "Notifications", path: "/notifications", badge: unreadCount },
    ];

    return (
        <div className="w-64 h-screen bg-zinc-950 border-r border-zinc-900 flex flex-col fixed left-0 top-0">
            {/* Logo Area */}
            <div className="p-6 border-b border-zinc-900">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                        <span className="text-black font-bold text-xl">E</span>
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">
                        EventHorizon
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-accent text-black font-medium shadow-[0_0_15px_rgba(204,251,81,0.3)]"
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "text-lg",
                                    isActive ? "text-black" : "text-zinc-500 group-hover:text-white"
                                )}
                            />
                            <div className="flex-1 flex items-center justify-between">
                                <span>{item.label}</span>
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                        isActive ? "bg-black text-accent" : "bg-accent text-black"
                                    )}>
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-zinc-900">
                <div className="bg-zinc-900/50 rounded-xl p-3 flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                            <FaUser className="text-zinc-500" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-zinc-500 text-xs truncate">@{user.username}</p>
                    </div>
                </div>
                
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors text-sm"
                >
                    <FaSignOutAlt />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
}
