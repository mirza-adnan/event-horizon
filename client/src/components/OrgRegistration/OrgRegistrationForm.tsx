import { useState } from "react";
import ProgressBar from "./ProgressBar";
import StepBasic from "./StepBasic";
import StepDetails from "./StepDetails";
import StepProof from "./StepProof";
import StepReview from "./StepReview";

const STEPS = ["Basic Info", "Details", "Proof", "Review"];

export default function OrgRegistrationForm() {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        city: "",
        country: "",
        website: "",
        description: "",
    });

    const [proofFile, setProofFile] = useState<File | null>(null);

    function updateField(name: string, value: string) {
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function nextStep() {
        setError(null);
        console.log(showSuccess);

        if (step === 0) {
            await validateStepOne();
        } else if (step === 2) {
            if (!proofFile) {
                setError("Proof of existence is required to proceed");
                return;
            }
            setStep((s) => s + 1);
        } else {
            setStep((s) => s + 1);
        }
    }

    function prevStep() {
        setError(null);
        console.log(showSuccess);
        if (step - 1 < STEPS.length - 1 && showSuccess) {
            setShowSuccess(false);
        }
        setStep((s) => s - 1);
    }

    async function validateStepOne() {
        setLoading(true);
        try {
            const res = await fetch(
                "http://localhost:5050/api/organizers/validate/basic",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: form.name,
                        email: form.email,
                        phone: form.phone,
                    }),
                }
            );

            if (!res.ok) {
                const data = await res.json();
                setError(
                    `An organizer with this ${data.field} already exists.`
                );
                return;
            }

            setStep(1);
        } catch {
            setError("Failed to validate organizer info");
        } finally {
            setLoading(false);
        }
    }

    async function submitFinal() {
        if (!proofFile) {
            setError("Proof of existence is required");
            return;
        }

        console.log(showSuccess);

        setLoading(true);
        setError(null);

        const fd = new FormData();
        Object.entries(form).forEach(([key, value]) => fd.append(key, value));
        fd.append("proof-document", proofFile);

        try {
            const res = await fetch(
                "http://localhost:5050/api/organizers/register",
                {
                    method: "POST",
                    body: fd,
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Registration failed");
                return;
            }

            if (step === STEPS.length - 1) {
                setShowSuccess(true);
            }
        } catch {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
            <div className="w-full max-w-2xl bg-zinc-900 rounded-2xl p-8 shadow-xl">
                {!showSuccess && (
                    <div className="mb-6">
                        <p className="text-2xl text-text-strong">
                            Join as a new organizer
                        </p>
                        <p className="text-sm text-text-weak">
                            Your first step towards organizing amazing events
                        </p>
                    </div>
                )}
                <ProgressBar
                    currentStep={showSuccess ? 4 : step}
                    steps={STEPS}
                />

                {error && (
                    <div className="mb-4 text-sm text-red-400">{error}</div>
                )}

                {/* Success content - stays within the form box */}
                {step === 3 && showSuccess && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-black"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>

                        <h3 className="text-xl font-semibold text-white mb-2">
                            Registration Complete!
                        </h3>

                        <p className="text-zinc-300 mb-6">
                            Please check your email to verify your account. Once
                            verified, your registration will be pending admin
                            approval.
                        </p>

                        <div className="bg-zinc-800 rounded-lg p-4 text-left">
                            <p className="text-sm text-zinc-400">
                                <strong>What happens next:</strong>
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                                <li className="flex items-start">
                                    <span className="text-accent mr-2">•</span>
                                    <span>
                                        Email verification sent to {form.email}
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-accent mr-2">•</span>
                                    <span>Admin review process begins</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-accent mr-2">•</span>
                                    <span>
                                        You'll receive an email when approved
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Regular steps */}
                {!showSuccess && step === 0 && (
                    <StepBasic
                        form={form}
                        onChange={updateField}
                    />
                )}
                {!showSuccess && step === 1 && (
                    <StepDetails
                        form={form}
                        onChange={updateField}
                    />
                )}
                {!showSuccess && step === 2 && (
                    <StepProof
                        file={proofFile}
                        setFile={setProofFile}
                    />
                )}
                {!showSuccess && step === 3 && (
                    <StepReview
                        form={form}
                        file={proofFile}
                    />
                )}

                <div className="flex justify-between mt-8">
                    {step > 0 && !showSuccess && (
                        <button
                            onClick={prevStep}
                            className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300"
                        >
                            Previous
                        </button>
                    )}

                    {!showSuccess && step < STEPS.length - 1 && (
                        <button
                            onClick={nextStep}
                            disabled={loading}
                            className="ml-auto px-6 py-2 rounded-lg bg-accent text-black font-semibold"
                        >
                            {loading ? "Checking..." : "Next"}
                        </button>
                    )}

                    {step === 3 && !showSuccess && (
                        <button
                            onClick={submitFinal}
                            disabled={loading}
                            className="ml-auto px-6 py-2 rounded-lg bg-accent text-black font-semibold"
                        >
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
