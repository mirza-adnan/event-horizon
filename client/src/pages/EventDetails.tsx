import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { useUserAuth } from "../hooks/useUserAuth";
import RegistrationModal from "../components/RegistrationModal";
import EventDetailsView, { type Event } from "../components/EventDetailsView";

export default function EventDetails() {
    const { id } = useParams();
    const { user } = useUserAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [selectedSegment, setSelectedSegment] = useState<any | null>(null);
    const [registeredSegmentIds, setRegisteredSegmentIds] = useState<string[]>([]);

    useEffect(() => {
        fetchEventDetails();
        if (user) {
            fetchRegistrationStatus();
        }
    }, [id, user]);

    const fetchEventDetails = async () => {
        try {
            const res = await fetch(`http://localhost:5050/api/events/${id}`);
            if (res.ok) {
                const data = await res.json();
                setEvent(data.event);
            } else {
                setError("Event not found");
            }
        } catch (err) {
            setError("Error loading event");
        } finally {
            setLoading(false);
        }
    };

    const fetchRegistrationStatus = async () => {
        try {
            const res = await fetch(`http://localhost:5050/api/registrations/event/${id}/status`, {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setRegisteredSegmentIds(data.registeredSegmentIds);
            }
        } catch (err) {
            console.error("Error fetching status", err);
        }
    };

    const handleRegisterClick = (segment: any) => {
        if (!user) {
            alert("Please login to register");
            return;
        }
        setSelectedSegment(segment);
        setIsRegisterModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 min-h-screen bg-zinc-950">
                <FaSpinner className="animate-spin text-accent text-3xl" />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="text-center py-20 min-h-screen bg-zinc-950 text-white">
                <h2 className="text-2xl font-bold mb-4">{error || "Event not found"}</h2>
                <Link to="/explore" className="text-accent hover:underline">Back to Explore</Link>
            </div>
        );
    }

    return (
        <>
            <EventDetailsView 
                event={event} 
                user={user} 
                registeredSegmentIds={registeredSegmentIds}
                onRegisterClick={handleRegisterClick} 
            />

            {/* Registration Modal */}
             {isRegisterModalOpen && selectedSegment && (
                <RegistrationModal
                    isOpen={isRegisterModalOpen}
                    onClose={() => {
                        setIsRegisterModalOpen(false);
                        fetchRegistrationStatus();
                    }}
                    event={event}
                    segment={selectedSegment}
                />
            )}
        </>
    );
}
