import { useState } from "react";
import ProgressBar from "./ProgressBar";
import StepBasic from "./StepBasic";
import StepDetails from "./StepDetails";
import StepProof from "./StepProof";
import StepReview from "./StepReview";

const STEPS = ["Basic Info", "Details", "Proof", "Review"];

// Bangladesh phone number regex
const BD_PHONE_REGEX = /^(?:\+?880|0)1[3-9]\d{8}$/;

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
        country: "Bangladesh",
        website: "",
        description: "",
    });

    const [proofFile, setProofFile] = useState<File | null>(null);

    function updateField(name: string, value: string) {
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function nextStep() {
        setError(null);

        // STEP 0: Basic validation
        if (step === 0) {
            if (
                !form.name.trim() ||
                !form.email.trim() ||
                !form.phone.trim() ||
                !form.password.trim()
            ) {
                setError("Please fill in all required fields");
                return;
            }

            if (!BD_PHONE_REGEX.test(form.phone)) {
                setError("Enter a valid Bangladeshi phone number");
                return;
            }

            await validateStepOne();
            return;
        }

        // STEP 2: Proof required
        if (step === 2 && !proofFile) {
            setError("Proof of existence is required to proceed");
            return;
        }

        setStep((s) => s + 1);
    }

    function prevStep() {
        setError(null);
        if (showSuccess) setShowSuccess(false);
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

            setShowSuccess(true);
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

                {step === 3 && showSuccess && (
                    <div className="text-center py-8">
                        <h3 className="text-xl font-semibold text-white mb-2">
                            Registration Complete!
                        </h3>
                        <p className="text-zinc-300">
                            Please check your email to verify your account. Once
                            verified, your registration will be awaiting admin
                            approval.
                        </p>
                    </div>
                )}

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

                    {!showSuccess && step < 3 && (
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
