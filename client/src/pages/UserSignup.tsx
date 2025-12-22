import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";

export default function UserSignup() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        dateOfBirth: "",
        country: "",
        status: "University",
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
                "http://localhost:5050/api/users/signup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        username: formData.username,
                        email: formData.email,
                        phone: formData.phone,
                        password: formData.password,
                        dateOfBirth: formData.dateOfBirth,
                        country: formData.country,
                        status: formData.status,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Registration failed");
                return;
            }

            navigate("/");
        } catch (err) {
            setError("An unexpected error occurred");
            console.error("Signup error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
            <div className="w-full max-w-2xl bg-zinc-900 rounded-2xl p-8 shadow-xl my-8">
                {/* header */}
                <div className="mb-6">
                    <p className="text-2xl text-text-strong">
                        Create Your Account
                    </p>
                    <p className="text-sm text-text-weak">
                        Join Event Horizon to discover and organize amazing
                        events
                    </p>
                </div>

                {error && (
                    <div className="mb-4 text-sm text-red-400">{error}</div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={(e) =>
                                handleInputChange("firstName", e.target.value)
                            }
                            required
                        />
                        <Input
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={(e) =>
                                handleInputChange("lastName", e.target.value)
                            }
                            required
                        />
                    </div>

                    {/* Username & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={(e) =>
                                handleInputChange("email", e.target.value)
                            }
                            required
                        />
                    </div>

                    {/* Password & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <Input
                            label="Phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={(e) =>
                                handleInputChange("phone", e.target.value)
                            }
                        />
                    </div>

                    {/* Date of Birth & Country */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Date of Birth"
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={(e) =>
                                handleInputChange("dateOfBirth", e.target.value)
                            }
                            required
                        />
                        <Input
                            label="Country"
                            name="country"
                            value={formData.country}
                            onChange={(e) =>
                                handleInputChange("country", e.target.value)
                            }
                        />
                    </div>

                    {/* Status Dropdown */}
                    <div className="space-y-2">
                        <label className="block ml-1">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) =>
                                handleInputChange("status", e.target.value)
                            }
                            className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent"
                        >
                            <option value="School">School</option>
                            <option value="High School">High School</option>
                            <option value="University">University</option>
                            <option value="Graduate">Graduate</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg bg-accent text-black font-semibold"
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center">
                    <p className="text-text-weak">
                        Already have an account? Login{" "}
                        <Link
                            to="/login"
                            className="text-accent hover:underline"
                        >
                            here
                        </Link>
                    </p>
                </div>

                {/* Organizer Registration Link */}
                <div className="mt-4 text-center">
                    <p className="text-text-weak">
                        Or join as an organizer{" "}
                        <Link
                            to="/organizers/registration"
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
