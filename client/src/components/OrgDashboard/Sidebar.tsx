import { Link, useLocation } from "react-router-dom";
import { cn } from "../../utils/helpers";

const navItems = [
    {
        name: "Events",
        icon: (
            <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17V7m0 10v6m6-2a3 3 0 100-6v6zm2-15H5M12 6v6M5 6h14v4H5V6z"
                />
            </svg>
        ),
        path: "/organizers/dashboard",
    },
    {
        name: "Create Event",
        icon: (
            <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
            </svg>
        ),
        path: "/organizers/event/create",
    },
    {
        name: "Profile",
        icon: (
            <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 017 7h0M12 14a7 7 0 007 7h0M12 14v6m-6 0a7 7 0 007 7h0M6 14a7 7 0 017-7h0"
                />
            </svg>
        ),
        path: "/organizers/dashboard/profile",
    },
    {
        name: "Settings",
        icon: (
            <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-.426 1.002-.426 1.428 0l1.58 1.58c1.496 1.496 3.808 1.304 5.212-.203 1.404-1.507 1.404-3.818 0-5.325L18.5 4.317c-.426-.426-1.002-.426-1.428 0l-1.58 1.58c-1.496 1.496-3.808 1.304-5.212-.203-1.404-1.507-1.404-3.818 0-5.325l1.58-1.58c.426-.426 1.002-.426 1.428 0l-1.58 1.58c1.496 1.496 3.808 1.304 5.212-.203 1.404-1.507 1.404-3.818 0-5.325L18.5 4.317c-.426-.426-1.002-.426-1.428 0l-1.58 1.58c-1.496 1.496-3.808 1.304-5.212-.203-1.404-1.507-1.404-3.818 0-5.325l1.58-1.58c.426-.426 1.002-.426 1.428 0l1.58 1.58c1.496 1.496 3.808 1.304 5.212-.203 1.404-1.507 1.404-3.818 0-5.325L18.5 4.317c-.426-.426-1.002-.426-1.428 0l-1.58 1.58c-1.496 1.496-3.808 1.304-5.212-.203-1.404-1.507-1.404-3.818 0-5.325l1.58-1.58c.426-.426 1.002-.426 1.428 0l1.58 1.58c1.496 1.496 3.808 1.304 5.212-.203 1.404-1.507 1.404-3.818 0-5.325L18.5 4.317c-.426-.426-1.002-.426-1.428 0l-1.58 1.58c-1.496 1.496-3.808 1.304-5.212-.203-1.404-1.507-1.404-3.818 0-5.325l1.58-1.58c.426-.426 1.002-.426 1.428 0l1.58 1.58c1.496 1.496 3.808 1.304 5.212-.203 1.404-1.507 1.404-3.818 0-5.325L18.5 4.317c-.426-.426-1.002-.426-1.428 0l-1.58 1.58c-1.496 1.496-3.808 1.304-5.212-.203-1.404-1.507-1.404-3.818 0-5.325l1.58-1.58c.426-.426 1.002-.426 1.428 0l1.58 1.58c1.496 1.496 3.808 1.304 5.212-.203 1.404-1.507 1.404-3.818 0-5.325L18.5 4.317c-.426-.426-1.002-.426-1.428 0l-1.58 1.58c-1.496 1.496-3.808 1.304-5.212-.203-1.404-1.507-1.404-3.818 0-5.325l1.58-1.58c.426-.426 1.002-.426 1.428 0l1.58 1.58c1.496 1.496 3.808 1.304 5.212-.203 1.404-1.507 1.404-3.818 0-5.325L18.5 4.317c-.426-.426-1.002-.426-1.428 0l-1.58 1.58c-1.496 1.496-3.808 1.304-5.212-.203-1.404-1.507-1.404-3.818 0-5.325l1.58-1.58c.426-.426 1.002-.426 1.428 0l1.58 1.58c1.496 1.496 3.808 1.304 5.212-.203 1.404-1.507 1.404-3.818 0-5.325L18.5 4.317c-.426-.426-1.002-.426-1.428 0l-1.58 1.58c-1.496 1.496-3.808 1.304-5.212-.203-1.404-1.507-......"
                />
            </svg>
        ),
        path: "/organizers/dashboard/settings",
    },
];

export default function Sidebar() {
    const location = useLocation();

    return (
        <aside className="w-64 bg-zinc-900 border-r border-zinc-800 min-h-screen flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
                        <span className="text-black font-bold text-sm">O</span>
                    </div>
                    <h1 className="text-lg font-semibold">
                        Organizer Dashboard
                    </h1>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                            "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
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
