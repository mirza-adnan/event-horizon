// client/src/components/OrganizerRegistrationRedirect.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganizerAuth } from "../hooks/useOrganizerAuth";
import OrgRegistration from "./OrgRegistration";

export default function OrgRegistrationRedirect() {
    const { isAuthenticated, loading } = useOrganizerAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate("/organizers/dashboard"); // Redirect to dashboard if already logged in
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading) {
        // Show a loading state while checking authentication
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

    // If not authenticated, show the registration form
    return <OrgRegistration />;
}
