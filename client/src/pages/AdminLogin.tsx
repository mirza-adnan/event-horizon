// client/src/pages/AdminLogin.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Hardcoded admin credentials
    const ADMIN_EMAIL = "admin@eventhorizon.com";
    const ADMIN_PASSWORD = "admin123";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            // Store admin session in localStorage
            localStorage.setItem("isAdminLoggedIn", "true");
            navigate("/admin/dashboard");
        } else {
            setError("Invalid email or password");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-8 shadow-xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-black font-bold text-xl">A</span>
                    </div>
                    <h1 className="text-2xl font-bold text-text-strong">
                        Admin Login
                    </h1>
                    <p className="text-text-weak">Access admin dashboard</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        className="w-full py-3 rounded-lg bg-accent text-black font-semibold"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
