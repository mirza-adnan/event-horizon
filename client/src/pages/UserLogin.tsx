import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Input from "../components/Input";
import { FaCheckCircle } from "react-icons/fa";

export default function UserLogin() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null); // For "Verified" toast
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check for verified query param
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get("verified") === "true") {
            setSuccessMsg("Email successfully verified! You can now access all features.");
        }
    }, [location]);

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
                        email: formData.email,
                        password: formData.password,
                    }),
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Login failed");
                return;
            }
            
            // Force reload to update auth state in context/hooks
            window.location.href = "/explore";
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
                {/* header */}
                <div className="mb-6">
                    <p className="text-2xl text-text-strong">Welcome Back</p>
                    <p className="text-sm text-text-weak">
                        Log in to your Event Horizon account
                    </p>
                </div>
                
                {successMsg && (
                    <div className="mb-6 p-4 bg-green-900/20 border border-green-900 rounded-lg flex items-center gap-3 text-green-400">
                        <FaCheckCircle className="flex-shrink-0" />
                        <p>{successMsg}</p>
                    </div>
                )}

                {error && (
                    <div className="mb-4 text-sm text-red-400">{error}</div>
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg bg-accent text-black font-semibold"
                    >
                        {loading ? "Logging In..." : "Login"}
                    </button>
                </form>

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
