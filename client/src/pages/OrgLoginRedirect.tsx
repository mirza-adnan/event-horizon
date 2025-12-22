import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganizerAuth } from "../hooks/useOrganizerAuth";
import OrgLogin from "./OrgLogin";

export default function OrgLoginRedirect() {
    const { isAuthenticated, loading } = useOrganizerAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate("/organizers/dashboard");
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-text-strong">
                    Checking authentication...
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        // If already authenticated, we'll be redirected by the useEffect
        return null;
    }

    // If not authenticated, show the login form
    return <OrgLogin />;
}
