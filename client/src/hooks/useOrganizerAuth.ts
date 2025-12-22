// client/src/hooks/useOrganizerAuth.ts
import { useState, useEffect } from "react";

export const useOrganizerAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
        null
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5050/api/organizers/me",
                    {
                        credentials: "include",
                    }
                );

                setIsAuthenticated(response.ok);
            } catch (error) {
                setIsAuthenticated(false);
                console.error("Auth check failed:", error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    return { isAuthenticated, loading };
};
