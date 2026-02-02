import { useEffect, useState } from "react";
import { FaImage, FaPaperPlane, FaSpinner } from "react-icons/fa";

interface Announcement {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
    segmentId?: string;
}

interface AnnouncementFeedProps {
    eventId: string;
    segmentId: string | null;
    feedLabel: string;
    isOrganizer?: boolean;
    showAll?: boolean;
}

export default function AnnouncementFeed({ 
    eventId, 
    segmentId, 
    feedLabel, 
    isOrganizer = false,
    showAll = false
}: AnnouncementFeedProps) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        fetchAnnouncements();
    }, [eventId, segmentId]);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
             const url = new URL(`http://localhost:5050/api/announcements/${eventId}`);
             if (segmentId) url.searchParams.append("segmentId", segmentId);
             
             const res = await fetch(url.toString());
             const data = await res.json();
             if (res.ok) {
                 setAnnouncements(data.announcements);
             }
        } catch (err) {
            console.error("Failed to fetch announcements", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setPosting(true);
        try {
            const formData = new FormData();
            formData.append("eventId", eventId);
            if (segmentId) formData.append("segmentId", segmentId);
            formData.append("title", title);
            formData.append("content", content);
            if (image) formData.append("image", image); 

            const res = await fetch("http://localhost:5050/api/announcements/create", {
                method: "POST",
                body: formData,
                 credentials: "include"
            });

            if (res.ok) {
                const data = await res.json();
                setAnnouncements([data.announcement, ...announcements]);
                setTitle("");
                setContent("");
                setImage(null);
            } else {
                alert("Failed to post announcement");
            }
        } catch (err) {
            console.error("Post error", err);
            alert("Error posting announcement");
        } finally {
            setPosting(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const filteredAnnouncements = announcements.filter(a => {
        if (showAll) return true;
        if (segmentId === null) return a.segmentId === null;
        return a.segmentId === segmentId || a.segmentId === null;
    });

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            {/* Post Creator */}
            {isOrganizer && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="font-bold text-white mb-4">
                        New Announcement for {feedLabel}
                    </h3>
                    <form onSubmit={handlePost} className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Title" 
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-zinc-800 border-none rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-accent"
                        />
                        <textarea 
                            placeholder="What's happening?" 
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            className="w-full bg-zinc-800 border-none rounded-lg px-4 py-2 text-white min-h-[100px] focus:ring-1 focus:ring-accent"
                        />
                        
                        {image && (
                             <div className="relative inline-block">
                                 <img src={URL.createObjectURL(image)} alt="Preview" className="h-20 w-auto rounded border border-zinc-700 object-cover" />
                                 <button 
                                     type="button" 
                                     onClick={() => setImage(null)}
                                     className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                 >
                                     x
                                 </button>
                             </div>
                        )}

                        <div className="flex justify-between items-center pt-2">
                            <label className="cursor-pointer text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
                                <FaImage />
                                <span className="text-sm">Add Image</span>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                            <button 
                                type="submit" 
                                disabled={posting || !title || !content}
                                className="bg-accent text-black px-6 py-2 rounded-lg font-bold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {posting ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                                Post
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Feed */}
            {loading ? (
                 <div className="flex justify-center py-10"><FaSpinner className="animate-spin text-accent text-2xl" /></div>
            ) : filteredAnnouncements.length === 0 ? (
                <div className="text-center py-10 text-zinc-500">
                    No announcements yet for this feed.
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredAnnouncements.map(item => (
                        <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors">
                            {item.imageUrl && (
                                <div className="h-48 w-full overflow-hidden">
                                    <img src={`http://localhost:5050${item.imageUrl}`} alt="Attachment" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                     <h4 className="font-bold text-lg text-white">{item.title}</h4>
                                     <span className="text-xs text-zinc-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-zinc-300 whitespace-pre-wrap">{item.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
