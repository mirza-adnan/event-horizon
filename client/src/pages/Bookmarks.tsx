import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBookmark, FaRegBookmark, FaSpinner, FaTrashAlt } from "react-icons/fa";
import { useUserAuth } from "../hooks/useUserAuth";
import EventActionMenu from "../components/EventActionMenu";

interface Bookmark {
    id: string;
    createdAt: string;
    event: {
        id: string;
        title: string;
        description: string;
        bannerUrl?: string;
        startDate: string;
        city: string;
        isOnline: boolean;
    };
}

export default function Bookmarks() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useUserAuth();

    const fetchBookmarks = async () => {
        try {
            const res = await fetch("http://localhost:5050/api/bookmarks/my", {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setBookmarks(data.bookmarks);
            }
        } catch (error) {
            console.error("Failed to fetch bookmarks:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveBookmark = async (e: React.MouseEvent, bookmarkId: string) => {
        e.stopPropagation();
        e.preventDefault();
        
        const bookmark = bookmarks.find(b => b.id === bookmarkId);
        if (!bookmark) return;

        try {
            const res = await fetch("http://localhost:5050/api/bookmarks/toggle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    eventId: bookmark.event.id
                }),
                credentials: "include"
            });
            if (res.ok) {
                setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
            }
        } catch (error) {
            console.error("Failed to remove bookmark:", error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) fetchBookmarks();
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <FaBookmark className="text-zinc-800 text-6xl mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">My Bookmarks</h2>
                <p className="text-gray-500">Please sign in to view your bookmarks.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
                    <FaBookmark size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">My Bookmarks</h1>
                    <p className="text-gray-400 text-sm">Events you've saved for later</p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <FaSpinner className="animate-spin text-accent text-3xl mb-4" />
                    <p className="text-gray-400">Loading your bookmarks...</p>
                </div>
            ) : bookmarks.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-zinc-800/50">
                    <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaRegBookmark className="text-zinc-600 text-3xl" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No bookmarks yet</h3>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto uppercase text-[10px] tracking-widest font-bold">
                        Events you bookmark while exploring will appear here.
                    </p>
                    <Link 
                        to="/explore" 
                        className="inline-flex items-center gap-2 bg-accent text-black px-8 py-3 rounded-xl font-bold hover:bg-accent/90 transition-all hover:scale-105"
                    >
                        Start Exploring
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {bookmarks.map((bookmark) => (
                        <Link 
                            key={bookmark.id} 
                            to={`/events/${bookmark.event.id}`}
                            className="group relative bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800/50 hover:border-accent transition-all duration-300 shadow-xl hover:shadow-accent/5 flex flex-col"
                        >
                            <div className="aspect-video relative overflow-hidden bg-zinc-800">
                                {bookmark.event.bannerUrl ? (
                                    <img
                                        src={`http://localhost:5050${bookmark.event.bannerUrl}`}
                                        alt={bookmark.event.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-700 font-bold opacity-20">
                                        Event Horizon
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button
                                        onClick={(e) => handleRemoveBookmark(e, bookmark.id)}
                                        className="p-2.5 bg-zinc-950/80 backdrop-blur-md rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                        title="Remove Bookmark"
                                    >
                                        <FaTrashAlt size={12} />
                                    </button>
                                    <div onClick={e => e.preventDefault()} className="p-2.5 bg-zinc-950/80 backdrop-blur-md rounded-full text-accent shadow-lg">
                                            <EventActionMenu 
                                            eventTitle={bookmark.event.title} 
                                            eventLink={`http://localhost:5173/events/${bookmark.event.id}`} 
                                            />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-accent transition-colors">
                                    {bookmark.event.title}
                                </h3>
                                <p className="text-zinc-500 text-sm mb-6 line-clamp-2">
                                    {bookmark.event.description}
                                </p>
                                <div className="mt-auto flex items-center justify-between text-xs font-medium uppercase tracking-widest">
                                    <div className="flex items-center gap-4 text-zinc-400">
                                        <span>{new Date(bookmark.event.startDate).toLocaleDateString()}</span>
                                        <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                                        <span className="text-accent">{bookmark.event.city}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
