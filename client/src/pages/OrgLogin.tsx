import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import { cn } from "../utils/helpers";

export default function OrgLogin() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleInputChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                "http://localhost:5050/api/organizers/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Login failed");
                return;
            }

            // Login successful - redirect to organizer dashboard or preserved location
            const state = location.state as { from?: { pathname: string; search: string } } | null;
            const from = state?.from ? state.from.pathname + state.from.search : "/organizers/dashboard";
            navigate(from, { replace: true });
        } catch (err) {
            setError("An unexpected error occurred");
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
            <div className="w-full max-w-[560px] bg-zinc-900 rounded-2xl p-8 shadow-xl">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-black font-bold text-xl">O</span>
                    </div>
                    <h1 className="text-2xl font-bold text-text-strong">
                        Organizer Login
                    </h1>
                    <p className="text-text-weak">
                        Access your organizer dashboard
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) =>
                            handleInputChange("email", e.target.value)
                        }
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={(e) =>
                            handleInputChange("password", e.target.value)
                        }
                        required
                    />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg bg-accent text-black font-semibold"
                    >
                        {loading ? "Logging In..." : "Login"}
                    </button>
                </form>

                {/* Links */}
                <div className="mt-8 space-y-4 text-center">
                    <p className="text-text-weak">
                        Not an official organizer yet? Register{" "}
                        <Link
                            to="/organizers/registration"
                            className="text-accent hover:underline"
                        >
                            here
                        </Link>
                    </p>

                    <p className="text-text-weak">
                        Or login as a user{" "}
                        <Link
                            to="/login"
                            className="text-accent hover:underline"
                        >
                            here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
