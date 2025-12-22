import { cn } from "../../utils/helpers";

function ProgressBar({
    steps,
    currentStep,
}: {
    steps: string[];
    currentStep: number;
}) {
    return (
        <div className="flex w-full mb-4 justify-center">
            {steps.map((_, index) => {
                const done = index < currentStep;
                const active = index === currentStep;
                const allComplete = currentStep >= steps.length;

                return (
                    <div
                        key={index}
                        className={cn("flex flex-1 items-center", {
                            "flex-none": index === steps.length - 1,
                        })}
                    >
                        {/* circle */}
                        <div
                            className={cn(
                                "w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold",
                                {
                                    "bg-accent text-black": done || allComplete,
                                    "border border-accent text-accent": active,
                                    "border border-zinc-700 text-zinc-500":
                                        !done && !active,
                                }
                            )}
                        >
                            {done || allComplete ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
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
                            ) : (
                                index + 1
                            )}
                        </div>

                        {/* bar */}
                        {index < steps.length - 1 && (
                            <div
                                className={cn("h-[2px] flex-grow mx-3", {
                                    "bg-accent": done,
                                    "bg-zinc-700": !done,
                                })}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default ProgressBar;
