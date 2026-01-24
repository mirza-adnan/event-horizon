export const fetchExternalEvents = async (query: string = "") => {
    try {
        const API_URL = "http://localhost:5050/api"; // Assuming API_URL is defined here or globally
        const url = query
            ? `${API_URL}/external-events?q=${encodeURIComponent(query)}`
            : `${API_URL}/external-events`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch external events");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching external events:", error);
        throw error;
    }
};
