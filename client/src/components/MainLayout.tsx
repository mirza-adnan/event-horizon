import { Outlet, useNavigate } from "react-router-dom";
import { useUserAuth } from "../hooks/useUserAuth";
import UserSidebar from "./UserSidebar";
import NavBar from "./HomePage/HomeNavBar";
import HomeFooter from "./HomePage/HomeFooter";
import { useState, useEffect } from "react";

export default function Layout() {
    const { isAuthenticated, user, loading } = useUserAuth();
    const navigate = useNavigate();

    // Handle Logout
    const handleLogout = () => {
        // Clear cookie
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        // Force reload or redirect
        window.location.href = "/login";
    };

    if (loading) {
        return (
             <div className="min-h-screen bg-bgr flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (isAuthenticated && user) {
        return (
            <div className="min-h-screen bg-bgr flex">
                <UserSidebar user={user} onLogout={handleLogout} />
                <main className="flex-1 ml-64 min-h-screen">
                    {/* Width compensation for fixed sidebar */}
                    <Outlet />
                </main>
            </div>
        );
    }

    // Default Layout for non-logged in users (Navbar + Content + Footer)
    return (
        <div className="min-h-screen bg-bgr flex flex-col">
            <NavBar />
            <main className="flex-1">
                <Outlet />
            </main>
             {/* Footer is handled by individual pages properly? No, let's put it here or let pages handle it? 
                HomeFooter was in Home.tsx div.
                If I put it here, it will show on Explore too. Explore had HomeFooter.
                So yes, put it here.
             */}
        </div>
        // Note: HomeFooter is usually at bottom.
    );
}
