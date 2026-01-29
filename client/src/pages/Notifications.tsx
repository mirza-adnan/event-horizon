import { useState, useEffect } from "react";
import { FaBell, FaExclamationCircle, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { cn } from "../utils/helpers";

interface Notification {
    id: string;
    type: string;
    message: string;
    link: string;
    isRead: boolean;
    createdAt: string;
}

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const res = await fetch("http://localhost:5050/api/notifications", {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);

                // Mark all as read after successful fetch if there are unread ones
                if (data.some((n: Notification) => !n.isRead)) {
                    await fetch("http://localhost:5050/api/notifications/read-all", {
                        method: "PUT",
                        credentials: "include"
                    });
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                }
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleNotificationClick = (link: string) => {
        if (!link) return;
        if (link.startsWith("http")) {
            window.location.href = link;
        } else {
            navigate(link);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-bgr">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen bg-bgr p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center">
                            <FaBell className="text-accent text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Notifications</h1>
                            <p className="text-zinc-500">Stay updated with your activities</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center">
                            <FaBell className="text-zinc-700 text-5xl mx-auto mb-4" />
                            <h3 className="text-white font-medium text-lg">No notifications yet</h3>
                            <p className="text-zinc-500">We'll notify you when something important happens.</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification.link)}
                                className={cn(
                                    "p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 cursor-pointer group",
                                    notification.isRead
                                        ? "bg-zinc-900/30 border-zinc-800/50 opacity-75"
                                        : "bg-zinc-900/80 border-accent/20 shadow-[0_4px_20px_rgba(204,251,81,0.05)]"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                    notification.type === 'invite' ? "bg-blue-500/20 text-blue-500" :
                                    notification.type === 'announcement' ? "bg-accent/20 text-accent" :
                                    "bg-zinc-800 text-zinc-400"
                                )}>
                                    {notification.type === 'invite' ? <FaUsers /> :
                                     notification.type === 'announcement' ? <FaBell /> :
                                     <FaExclamationCircle />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white mb-1 group-hover:text-accent transition-colors font-medium">
                                        {notification.message}
                                    </p>
                                    <p className="text-zinc-500 text-xs">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <div className="w-2 h-2 rounded-full bg-accent mt-2 shadow-[0_0_8px_#CCFB51]"></div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
