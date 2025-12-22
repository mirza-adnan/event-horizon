export default function StepSuccess({ email }: { email: string }) {
    return (
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
                Please check your email to verify your account. Once verified,
                your registration will be pending admin approval.
            </p>

            <div className="bg-zinc-800 rounded-lg p-4 text-left">
                <p className="text-sm text-zinc-400">
                    <strong>What happens next:</strong>
                </p>
                <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                    <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Email verification sent to {email}</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Admin review process begins</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>You'll receive notification when approved</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
