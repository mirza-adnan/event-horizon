export const fetchExternalEvents = async () => {
    try {
        const response = await fetch(
            `http://localhost:5050/api/external-events`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch external events");
        }

        const data = await response.json();
        return data; // Expecting array of events
    } catch (error) {
        console.error("Error fetching external events:", error);
        throw error;
    }
};
