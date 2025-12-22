// client/src/components/ProtectedRoute.tsx
import { useOrganizerAuth } from "../hooks/useOrganizerAuth";
import { Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    redirectPath?: string;
}

export default function ProtectedRoute({
    children,
    redirectPath = "/organizers/login",
}: ProtectedRouteProps) {
    const { isAuthenticated, loading } = useOrganizerAuth();
    const location = useLocation();

    if (loading) {
        // You can return a loading spinner here if desired
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-text-strong">
                    Checking authentication...
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login with return URL
        return (
            <Navigate
                to={redirectPath}
                state={{ from: location }}
                replace
            />
        );
    }

    return <>{children}</>;
}
