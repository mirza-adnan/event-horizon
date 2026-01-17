// client/src/components/admin/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../utils/helpers";

const navItems = [
    {
        name: "Pending Organizers",
        path: "/admin/pending",
    },
    {
        name: "Categories",
        path: "/admin/categories",
    },
    {
        name: "External Events",
        path: "/admin/external-events",
    },
];

export default function AdminSidebar() {
    const location = useLocation();

    return (
        <aside className="w-64 bg-zinc-900 border-r border-zinc-800 h-screen sticky top-0 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
                        <span className="text-black font-bold text-sm">A</span>
                    </div>
                    <h1 className="text-lg font-semibold">Admin Dashboard</h1>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
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
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
