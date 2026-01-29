import { Navigate, useLocation } from "react-router-dom";
import { useOrganizerAuth } from "../../hooks/useOrganizerAuth";
import type { ReactNode } from "react";

interface OrgProtectedRouteProps {
    children: ReactNode;
}

export default function OrgProtectedRoute({ children }: OrgProtectedRouteProps) {
    const { isAuthenticated, loading } = useOrganizerAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-bgr flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/organizers/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
