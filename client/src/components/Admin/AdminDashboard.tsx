// client/src/pages/AdminDashboard.tsx
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white flex">
            <AdminSidebar />
            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
}
