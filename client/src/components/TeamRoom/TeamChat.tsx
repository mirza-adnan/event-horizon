import { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaSpinner } from "react-icons/fa";
import { useUserAuth } from "../../hooks/useUserAuth";
import { cn } from "../../utils/helpers";

interface ChatProps {
    teamId: string;
    myRole: string;
}

interface Message {
    id: string;
    message: string;
    createdAt: string;
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
}

export default function TeamChat({ teamId }: ChatProps) {
    const { user } = useUserAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchChats();
        const interval = setInterval(fetchChats, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, [teamId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchChats = async () => {
        try {
            const res = await fetch(`http://localhost:5050/api/teams/${teamId}/chats`, {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                // Check if new messages arrived to avoid constant re-render or only update if changed
                // For simplicity, just setMessages for now. 
                // Optimization: compare last message ID.
                setMessages(prev => {
                    if (data.chats.length !== prev.length || (data.chats.length > 0 && data.chats[data.chats.length-1].id !== prev[prev.length-1]?.id)) {
                        return data.chats;
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.error("Error fetching chats", error);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const tempIdx = Date.now().toString();
        const optimisticMsg: Message = {
            id: tempIdx,
            message: newMessage,
            createdAt: new Date().toISOString(),
            userId: user?.id || "",
            firstName: user?.firstName || "Me",
            lastName: user?.lastName || "",
            avatarUrl: user?.avatarUrl
        };

        // Optimistic update
        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage("");
        setSending(true);

        try {
            const res = await fetch(`http://localhost:5050/api/teams/${teamId}/chats`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: optimisticMsg.message }),
                credentials: "include"
            });

            if (res.ok) {
                // Fetch to get the real message with ID and server timestamp
                fetchChats(); 
            } else {
                 // Remove optimistic message on error? or show error state
                 console.error("Failed to send");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-10">
                        No messages yet. Start the conversation!
                    </div>
                )}
                
                {messages.map((msg) => {
                    const isMe = msg.userId === user?.id;
                    return (
                        <div key={msg.id} className={cn("flex gap-3", isMe ? "flex-row-reverse" : "")}>
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden border border-zinc-700 mt-1">
                                {msg.avatarUrl ? (
                                    <img src={msg.avatarUrl} alt={msg.firstName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs text-gray-400">{msg.firstName.charAt(0)}</span>
                                )}
                            </div>
                            <div className={cn("max-w-[70%]", isMe ? "items-end" : "items-start")}>
                                <div className={cn(
                                    "px-4 py-2 rounded-2xl text-sm shadow-sm",
                                    isMe 
                                        ? "bg-accent/10 border border-accent/20 text-white rounded-tr-sm" 
                                        : "bg-zinc-800 border border-zinc-700 text-gray-200 rounded-tl-sm"
                                )}>
                                    <p>{msg.message}</p>
                                </div>
                                <p className={cn("text-[10px] text-gray-500 mt-1", isMe ? "text-right" : "")}>
                                    {!isMe && <span className="mr-2 font-medium text-gray-400">{msg.firstName}</span>}
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-800 shrink-0">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-full px-4 py-3 text-white focus:border-accent outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="bg-accent text-black w-12 h-12 rounded-full flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-50"
                    >
                        {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                    </button>
                </form>
            </div>
        </div>
    );
}
