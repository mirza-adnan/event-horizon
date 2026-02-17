// client/src/components/OrgDashboard/Sidebar.tsx
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../utils/helpers";
import {
    FaCalendarAlt,
    FaPlus,
    FaUser,
    FaCog,
    FaSignOutAlt,
} from "react-icons/fa";

interface Organizer {
    id: string;
    name: string;
    email: string;
    status: string;
    verified: boolean;
    createdAt: string;
}

const navItems = [
    {
        name: "Events",
        icon: <FaCalendarAlt className="w-5 h-5" />,
        path: "/organizers/dashboard",
    },
    {
        name: "Create Event",
        icon: <FaPlus className="w-5 h-5" />,
        path: "/organizers/event/create",
    },
    {
        name: "Profile",
        icon: <FaUser className="w-5 h-5" />,
        path: "/organizers/dashboard/profile",
    },
    {
        name: "Settings",
        icon: <FaCog className="w-5 h-5" />,
        path: "/organizers/dashboard/settings",
    },
];

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [organizer, setOrganizer] = useState<Organizer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrganizer = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5050/api/organizers/me",
                    {
                        credentials: "include",
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setOrganizer(data);
                } else {
                    console.error("Failed to fetch organizer info");
                }
            } catch (error) {
                console.error("Error fetching organizer:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizer();
    }, []);

    const handleLogout = async () => {
        try {
            const response = await fetch(
                "http://localhost:5050/api/organizers/logout",
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            if (response.ok) {
                navigate("/");
            } else {
                console.error("Logout failed");
            }
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    if (loading) {
        return (
            <aside className="w-64 bg-zinc-900 border-r border-zinc-800 min-h-screen flex flex-col">
                <div className="p-6 border-b border-zinc-800">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
                            <span className="text-black font-bold text-sm">
                                O
                            </span>
                        </div>
                        <h1 className="text-lg font-semibold">Loading...</h1>
                    </div>
                </div>
            </aside>
        );
    }

    return (
        <aside className="w-64 bg-zinc-900 border-r border-zinc-800 min-h-screen flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800">
                <div className="flex flex-col space-y-2">
                    <Link to={organizer ? `/organizer/${organizer.id}` : "#"} className="group">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-accent rounded flex items-center justify-center group-hover:bg-accent/80 transition-colors">
                                <span className="text-black font-bold text-sm">
                                    O
                                </span>
                            </div>
                            <h1 className="text-lg font-semibold group-hover:text-accent transition-colors">
                                {organizer?.name || "Organizer"}
                            </h1>
                        </div>
                    </Link>
                    <p className="text-xs text-text-weak truncate">
                        {organizer?.email}
                    </p>
                    <button
                        onClick={handleLogout}
                        className="mt-3 flex items-center space-x-2 px-3 py-2 rounded-md text-text-weak hover:bg-zinc-800 transition-colors"
                    >
                        <FaSignOutAlt className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-4">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                            "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-sm",
                            location.pathname === item.path
                                ? "bg-accent text-black"
                                : "hover:bg-zinc-800"
                        )}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
