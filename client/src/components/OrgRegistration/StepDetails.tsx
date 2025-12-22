import Input from "../Input";

export default function StepDetails({ form, onChange }: any) {
    return (
        <div className="space-y-5">
            <Input
                label="Address"
                value={form.address}
                onChange={(e) => onChange("address", e.target.value)}
            />

            <Input
                label="City"
                value={form.city}
                onChange={(e) => onChange("city", e.target.value)}
            />

            <Input
                label="Country"
                value={form.country}
                onChange={(e) => onChange("country", e.target.value)}
            />

            <Input
                label="Website"
                value={form.website}
                onChange={(e) => onChange("website", e.target.value)}
            />

            <div>
                <label className="block mb-1 text-sm text-zinc-400">
                    Description
                </label>
                <textarea
                    value={form.description}
                    onChange={(e) => onChange("description", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white
                     border border-zinc-700 focus:border-accent outline-none"
                />
            </div>
        </div>
    );
}
