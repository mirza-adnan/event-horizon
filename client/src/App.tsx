import { Outlet, useNavigate } from "react-router-dom";
import { useUserAuth } from "./hooks/useUserAuth";
import UserSidebar from "./components/UserSidebar";
import NavBar from "./components/HomePage/HomeNavBar";

function App() {
    const { isAuthenticated, user, loading } = useUserAuth();

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
