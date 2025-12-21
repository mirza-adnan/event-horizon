import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function OrganizerDashboard() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white flex">
            <Sidebar />
            <main className="flex-1 min-h-screen">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
