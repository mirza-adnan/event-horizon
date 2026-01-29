import { Outlet, useNavigate } from "react-router-dom";
import { useUserAuth } from "./hooks/useUserAuth";
import { useOrganizerAuth } from "./hooks/useOrganizerAuth";
import UserSidebar from "./components/UserSidebar";
import NavBar from "./components/HomePage/HomeNavBar";

function App() {
    const { isAuthenticated: isUserAuth, user, loading: userLoading } = useUserAuth();
    const { isAuthenticated: isOrgAuth, loading: orgLoading } = useOrganizerAuth();

    // Handle Logout
    const handleLogout = async () => {
        try {
            await fetch("http://localhost:5050/api/users/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout failed", error);
        }
        // Force reload or redirect
        window.location.href = "/login";
    };

    if (userLoading || orgLoading) {
        return (
             <div className="min-h-screen bg-bgr flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (isUserAuth && user) {
        return (
            <div className="min-h-screen bg-bgr flex">
                <UserSidebar user={user} onLogout={handleLogout} />
                <main className="flex-1 ml-64 min-h-screen">
                    <Outlet />
                </main>
            </div>
        );
    }

    if (isOrgAuth) {
        // Organizer Layout (No public navbar)
        // Usually renders OrganizerDashboard which has its own sidebar
        return (
            <div className="min-h-screen bg-bgr">
                <main className="min-h-screen">
                    <Outlet />
                </main>
            </div>
        );
    }

    // Default Layout for non-logged in users
    return (
        <div className="min-h-screen bg-bgr flex flex-col">
            <NavBar />
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
}

export default App;
