import { Navigate } from "react-router-dom";
import HeroSection from "../components/HomePage/HeroSection.tsx";
import { useUserAuth } from "../hooks/useUserAuth";
import { useOrganizerAuth } from "../hooks/useOrganizerAuth";

function Home() {
    const { isAuthenticated: isUserAuth, loading: userLoading } = useUserAuth();
    const { isAuthenticated: isOrgAuth, loading: orgLoading } = useOrganizerAuth();

    if (userLoading || orgLoading) return null; // Or a spinner

    if (isUserAuth) {
        return <Navigate to="/explore" replace />;
    }

    if (isOrgAuth) {
        return <Navigate to="/organizers/dashboard" replace />;
    }

    return (
        <div className="max-w-7xl mx-auto pt-5 px-6">
            <HeroSection />
        </div>
    );
}

export default Home;
