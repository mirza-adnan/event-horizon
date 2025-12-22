import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface AdminProtectedRouteProps {
    children: React.ReactNode;
    redirectPath?: string;
}

export default function AdminProtectedRoute({
    children,
    redirectPath = "/admin/login",
}: AdminProtectedRouteProps) {
    const location = useLocation();

    // Check if admin is logged in using localStorage
    const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";

    if (!isAdminLoggedIn) {
        // Redirect to admin login with return URL
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
