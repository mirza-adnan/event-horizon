import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";

export default function UserLogin() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleInputChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                "http://localhost:5050/api/users/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        password: formData.password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Login failed");
                return;
            }

            // Login successful - redirect to dashboard or home
            navigate("/");
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
                <div className="mb-6">
                    <p className="text-2xl text-text-strong">Welcome Back</p>
                    <p className="text-sm text-text-weak">
                        Log in to your Event Horizon account
                    </p>
                </div>

                {error && (
                    <div className="mb-4 text-sm text-red-400">{error}</div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <Input
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={(e) =>
                            handleInputChange("username", e.target.value)
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

                {/* Signup Link */}
                <div className="mt-6">
                    <p className="text-text-weak">
                        Don't have an account?{" "}
                        <Link
                            to="/signup"
                            className="text-accent hover:underline"
                        >
                            Sign up here
                        </Link>
                    </p>
                </div>

                {/* Organizer Login Link */}
                <div className="mt-4">
                    <p className="text-text-weak">
                        Or login as an organizer{" "}
                        <Link
                            to="/organizers/login"
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
