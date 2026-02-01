import { useState, useEffect } from "react";
import { FaBell, FaBellSlash } from "react-icons/fa";
import { useUserAuth } from "../hooks/useUserAuth";
import { cn } from "../utils/helpers";

interface SubscribeButtonProps {
    organizerId: string;
}

export default function SubscribeButton({ organizerId }: SubscribeButtonProps) {
    const { isAuthenticated } = useUserAuth();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`http://localhost:5050/api/organizers/profile/${organizerId}/status`, {
                    credentials: "include"
                });
                if (res.ok) {
                    const data = await res.json();
                    setIsSubscribed(data.isSubscribed);
                }
            } catch (error) {
                console.error("Failed to fetch subscription status:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, [organizerId, isAuthenticated]);

    const handleToggle = async () => {
        if (!isAuthenticated) {
            // Redirect to login or show signup? For now just return
            return;
        }

        setActionLoading(true);
        try {
            const action = isSubscribed ? "unsubscribe" : "subscribe";
            const res = await fetch(`http://localhost:5050/api/organizers/profile/${organizerId}/${action}`, {
                method: "POST",
                credentials: "include"
            });

            if (res.ok) {
                setIsSubscribed(!isSubscribed);
            }
        } catch (error) {
            console.error(`Failed to ${isSubscribed ? "unsubscribe" : "subscribe"}:`, error);
        } finally {
            setActionLoading(false);
        }
    };

    if (!isAuthenticated) return null; // Only users can subscribe
    if (loading) return <div className="h-10 w-32 bg-zinc-800 animate-pulse rounded-xl" />;

    return (
        <button
            onClick={handleToggle}
            disabled={actionLoading}
            className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-300",
                isSubscribed
                    ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                    : "bg-accent text-black hover:bg-accent/90 shadow-[0_4px_15px_rgba(204,251,81,0.2)]"
            )}
        >
            {isSubscribed ? (
                <>
                    <FaBellSlash />
                    <span>Unsubscribe</span>
                </>
            ) : (
                <>
                    <FaBell />
                    <span>Subscribe</span>
                </>
            )}
        </button>
    );
}
