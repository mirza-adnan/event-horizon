import { useState } from "react";
import { FaPlus, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { cn } from "../../utils/helpers";

interface Constraint {
    id: string;
    type: "age" | "gender" | "domain" | "code" | "status";
    includedSegments: string[]; // Segment IDs or "all"
    config: any;
}

interface Segment {
    id: number | string;
    name: string;
}

interface EventConstraintsProps {
    constraints: Constraint[];
    onAddConstraint: (constraint: Constraint) => void;
    onUpdateConstraint: (id: string, updatedConstraint: Constraint) => void;
    onRemoveConstraint: (id: string) => void;
    hasMultipleSegments: boolean;
    segments: Segment[];
}

export default function EventConstraints({
    constraints,
    onAddConstraint,
    onUpdateConstraint,
    onRemoveConstraint,
    hasMultipleSegments,
    segments,
}: EventConstraintsProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [expandedConstraint, setExpandedConstraint] = useState<string | null>(
        null
    );
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestData, setRequestData] = useState({ name: "", description: "" });
    const [isRequesting, setIsRequesting] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState(false);
    const [requestError, setRequestError] = useState("");

    const handleRequestConstraint = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRequesting(true);
        setRequestError("");
        setRequestSuccess(false);

        try {
            const res = await fetch("http://localhost:5050/api/constraints/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to request constraint");

            setRequestSuccess(true);
            setRequestData({ name: "", description: "" });
            setTimeout(() => {
                setIsRequestModalOpen(false);
                setRequestSuccess(false);
            }, 2000);
        } catch (err: any) {
            setRequestError(err.message || "Unknown error occurred");
        } finally {
            setIsRequesting(false);
        }
    };

    const handleAddConstraint = (type: "age" | "gender" | "domain" | "code" | "status") => {
        let baseConfig: any = {};
        if (type === "age") baseConfig = { minAge: "", maxAge: "" };
        if (type === "gender") baseConfig = { allowedGenders: [] };
        if (type === "status") baseConfig = { allowedStatuses: [] };
        if (type === "domain") baseConfig = { allowedDomains: "" };
        if (type === "code") baseConfig = { code: "" };

        const newConstraint: Constraint = {
            id: Date.now().toString() + Math.random().toString(),
            type,
            includedSegments: ["all"],
            config: baseConfig,
        };

        onAddConstraint(newConstraint);
        setExpandedConstraint(newConstraint.id);
        setIsDropdownOpen(false);
    };

    const toggleExpand = (id: string) => {
        setExpandedConstraint((prev) => (prev === id ? null : id));
    };

    const updateConfig = (id: string, key: string, value: any) => {
        const constraint = constraints.find((c) => c.id === id);
        if (!constraint) return;

        onUpdateConstraint(id, {
            ...constraint,
            config: {
                ...constraint.config,
                [key]: value,
            },
        });
    };

    const toggleSegment = (id: string, segmentId: string) => {
        const constraint = constraints.find((c) => c.id === id);
        if (!constraint) return;

        let newIncluded = [...constraint.includedSegments];

        if (segmentId === "all") {
            if (newIncluded.includes("all")) {
                newIncluded = [];
            } else {
                newIncluded = ["all"];
            }
        } else {
            // Remove "all" if present
            newIncluded = newIncluded.filter((s) => s !== "all");

            if (newIncluded.includes(segmentId)) {
                newIncluded = newIncluded.filter((s) => s !== segmentId);
            } else {
                newIncluded.push(segmentId);
            }
        }

        onUpdateConstraint(id, {
            ...constraint,
            includedSegments: newIncluded,
        });
    };

    const renderConfigForm = (constraint: Constraint) => {
        const { type, config } = constraint;

        if (type === "age") {
            return (
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-xs text-text-weak mb-1">
                            Min Age
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={config.minAge}
                            onChange={(e) =>
                                updateConfig(
                                    constraint.id,
                                    "minAge",
                                    e.target.value
                                )
                            }
                            className="w-full bg-zinc-950 border border-stroke-weak rounded-md px-3 py-2 text-sm text-text-strong"
                            placeholder="e.g. 18"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-text-weak mb-1">
                            Max Age
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={config.maxAge}
                            onChange={(e) =>
                                updateConfig(
                                    constraint.id,
                                    "maxAge",
                                    e.target.value
                                )
                            }
                            className="w-full bg-zinc-950 border border-stroke-weak rounded-md px-3 py-2 text-sm text-text-strong"
                            placeholder="e.g. 30"
                        />
                    </div>
                </div>
            );
        }

        if (type === "gender") {
            const genders = ["male", "female", "other"];
            const selected = config.allowedGenders || [];
            
            const handleGenderToggle = (g: string) => {
                const newSelection = selected.includes(g) 
                    ? selected.filter((s: string) => s !== g)
                    : [...selected, g];
                updateConfig(constraint.id, "allowedGenders", newSelection);
            };

            return (
                <div className="mt-4">
                    <label className="block text-xs text-text-weak mb-2">
                        Allowed Genders
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {genders.map((g) => (
                            <button
                                key={g}
                                type="button"
                                onClick={() => handleGenderToggle(g)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                                    selected.includes(g)
                                        ? "bg-accent/20 border-accent text-accent"
                                        : "bg-zinc-950 border-stroke-weak text-text-weak hover:text-text-strong"
                                )}
                            >
                                {g.charAt(0).toUpperCase() + g.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        if (type === "status") {
            const statuses = ["School", "High School", "University", "Graduate", "Other"];
            const selected = config.allowedStatuses || [];
            
            const handleStatusToggle = (s: string) => {
                const newSelection = selected.includes(s) 
                    ? selected.filter((item: string) => item !== s)
                    : [...selected, s];
                updateConfig(constraint.id, "allowedStatuses", newSelection);
            };

            return (
                <div className="mt-4">
                    <label className="block text-xs text-text-weak mb-2">
                        Allowed Statuses
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {statuses.map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => handleStatusToggle(s)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                                    selected.includes(s)
                                        ? "bg-accent/20 border-accent text-accent"
                                        : "bg-zinc-950 border-stroke-weak text-text-weak hover:text-text-strong"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        if (type === "domain") {
            return (
                <div className="mt-4">
                    <label className="block text-xs text-text-weak mb-1">
                        Allowed Email Domains (comma separated)
                    </label>
                    <input
                        type="text"
                        value={config.allowedDomains}
                        onChange={(e) =>
                            updateConfig(
                                constraint.id,
                                "allowedDomains",
                                e.target.value
                            )
                        }
                        className="w-full bg-zinc-950 border border-stroke-weak rounded-md px-3 py-2 text-sm text-text-strong"
                        placeholder="e.g. mit.edu, stanford.edu"
                    />
                </div>
            );
        }

        if (type === "code") {
            return (
                <div className="mt-4">
                    <label className="block text-xs text-text-weak mb-1">
                        Registration Code
                    </label>
                    <input
                        type="text"
                        value={config.code}
                        onChange={(e) =>
                            updateConfig(constraint.id, "code", e.target.value)
                        }
                        className="w-full bg-zinc-950 border border-stroke-weak rounded-md px-3 py-2 text-sm text-text-strong"
                        placeholder="Enter secret code"
                    />
                </div>
            );
        }

        return null;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-text-strong">
                        Event Constraints
                    </h3>
                    <p className="text-sm text-text-weak">
                        Define rules that participants must meet to register.
                    </p>
                </div>
                
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-text-strong rounded-lg transition-colors text-sm font-medium"
                    >
                        <FaPlus className="text-xs" />
                        <span>Add Constraint</span>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-stroke-weak rounded-lg shadow-xl overflow-hidden z-10">
                            <button
                                type="button"
                                onClick={() => handleAddConstraint("age")}
                                className="block w-full text-left px-4 py-3 text-sm text-text-strong hover:bg-zinc-800"
                            >
                                Age Limit
                            </button>
                            <button
                                type="button"
                                onClick={() => handleAddConstraint("gender")}
                                className="block w-full text-left px-4 py-3 text-sm text-text-strong hover:bg-zinc-800"
                            >
                                Gender Limit
                            </button>
                            <button
                                type="button"
                                onClick={() => handleAddConstraint("domain")}
                                className="block w-full text-left px-4 py-3 text-sm text-text-strong hover:bg-zinc-800"
                            >
                                Email Domain
                            </button>
                            <button
                                type="button"
                                onClick={() => handleAddConstraint("code")}
                                className="block w-full text-left px-4 py-3 text-sm text-text-strong hover:bg-zinc-800"
                            >
                                Registration Code
                            </button>
                            <button
                                type="button"
                                onClick={() => handleAddConstraint("status")}
                                className="block w-full text-left px-4 py-3 text-sm text-text-strong hover:bg-zinc-800"
                            >
                                User Status Limit
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {constraints.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-stroke-weak rounded-xl text-center">
                    <p className="text-text-weak">No constraints added yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {constraints.map((constraint) => {
                        const isExpanded = expandedConstraint === constraint.id;
                        
                        let title = "";
                        if (constraint.type === "age") title = "Age Limit";
                        if (constraint.type === "gender") title = "Gender Limit";
                        if (constraint.type === "domain") title = "Email Domain";
                        if (constraint.type === "code") title = "Registration Code";
                        if (constraint.type === "status") title = "User Status Limit";

                        return (
                            <div
                                key={constraint.id}
                                className="border border-stroke-weak rounded-xl overflow-hidden bg-zinc-900 border-l-4 border-l-accent"
                            >
                                <div
                                    className="px-4 py-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50"
                                    onClick={() => toggleExpand(constraint.id)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="font-medium text-text-strong">
                                            {title}
                                        </div>
                                        {hasMultipleSegments && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-text-weak">
                                                {constraint.includedSegments.includes("all") 
                                                    ? "Applies to all segments" 
                                                    : `Applies to ${constraint.includedSegments.length} segment(s)`}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemoveConstraint(constraint.id);
                                            }}
                                            className="text-text-weak hover:text-red-400 p-1"
                                        >
                                            <FaTrash className="text-sm" />
                                        </button>
                                        <div className="text-text-weak">
                                            {isExpanded ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-4 pb-4 border-t border-stroke-weak/50">
                                        {renderConfigForm(constraint)}

                                        {hasMultipleSegments && segments.length > 0 && (
                                            <div className="mt-6 pt-4 border-t border-stroke-weak/50">
                                                <label className="block text-xs text-text-weak mb-2">
                                                    Apply to Segments
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSegment(constraint.id, "all")}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                                                            constraint.includedSegments.includes("all")
                                                                ? "bg-accent/20 border-accent text-accent"
                                                                : "bg-zinc-950 border-stroke-weak text-text-weak hover:text-text-strong"
                                                        )}
                                                    >
                                                        All Segments
                                                    </button>
                                                    {segments.map((segment) => (
                                                        <button
                                                            key={segment.id}
                                                            type="button"
                                                            onClick={() => toggleSegment(constraint.id, String(segment.id))}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                                                                !constraint.includedSegments.includes("all") && constraint.includedSegments.includes(String(segment.id))
                                                                    ? "bg-accent/20 border-accent text-accent"
                                                                    : "bg-zinc-950 border-stroke-weak text-text-weak hover:text-text-strong"
                                                            )}
                                                        >
                                                            {segment.name || "Unnamed Segment"}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="mt-4 pt-3 border-t border-stroke-weak/50 flex items-start gap-2 text-xs text-text-weak">
                                            <span className="text-accent mt-0.5">ℹ</span>
                                            <p>If this constraint is applied to a Team Segment, <strong>all</strong> members of the team must satisfy it.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Request New Constraint Button */}
            <div className="pt-4 flex justify-center mt-6">
                <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(true)}
                    className="text-xs text-text-weak hover:text-accent transition-colors underline underline-offset-4"
                >
                    Didn't find what you need? Request a new constraint.
                </button>
            </div>

            {/* Request New Constraint Modal */}
            {isRequestModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-stroke-weak w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-stroke-weak">
                            <h3 className="text-xl font-bold text-text-strong">Request New Constraint</h3>
                            <p className="text-sm text-text-weak mt-1">
                                Let us know what criteria you need to filter attendees.
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            {requestSuccess && (
                                <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-lg">
                                    Constraint requested successfully! We'll review it soon.
                                </div>
                            )}
                            {requestError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                                    {requestError}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-text-strong mb-1">Constraint Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={requestData.name}
                                    onChange={(e) => setRequestData({ ...requestData, name: e.target.value })}
                                    className="w-full bg-zinc-950 border border-stroke-weak rounded-xl px-4 py-3 text-text-strong focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                                    placeholder="e.g. Current Company"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-strong mb-1">Description *</label>
                                <textarea
                                    required
                                    value={requestData.description}
                                    onChange={(e) => setRequestData({ ...requestData, description: e.target.value })}
                                    rows={4}
                                    className="w-full bg-zinc-950 border border-stroke-weak rounded-xl px-4 py-3 text-text-strong focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all resize-none"
                                    placeholder="Explain how this constraint should work (e.g. limits attendees to specific companies like Google or Microsoft)."
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-stroke-weak flex justify-end gap-3 bg-zinc-900/50">
                            <button
                                type="button"
                                onClick={() => setIsRequestModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-text-strong bg-zinc-800 hover:bg-zinc-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleRequestConstraint}
                                disabled={isRequesting || !requestData.name || !requestData.description}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black bg-accent hover:bg-accent/90 disabled:opacity-50 transition"
                            >
                                {isRequesting ? "Submitting..." : "Submit Request"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
