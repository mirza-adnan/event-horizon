export default function StepReview({ form, file }: any) {
    function Item({ label, value }: any) {
        return (
            <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">{label}</span>
                <span className="text-white">{value || "—"}</span>
            </div>
        );
    }

    // Function to determine if file is an image
    function isImageFile(file: File | null): boolean {
        if (!file) return false;
        return file.type.startsWith("image/");
    }

    // Get file preview URL
    function getFilePreview(): string {
        if (!file) return "";
        if (isImageFile(file)) {
            return URL.createObjectURL(file);
        }
        return "";
    }

    return (
        <div className="space-y-4 text-sm">
            <Item
                label="Organization"
                value={form.name}
            />
            <Item
                label="Email"
                value={form.email}
            />
            <Item
                label="Phone"
                value={form.phone}
            />
            <Item
                label="Website"
                value={form.website}
            />
            <Item
                label="City"
                value={form.city}
            />
            <Item
                label="Country"
                value={form.country}
            />

            <div className="pt-2">
                <span className="text-zinc-400">Proof of Validity</span>
                <div className="mt-2">
                    {file && isImageFile(file) ? (
                        // Show image preview
                        <img
                            src={getFilePreview()}
                            alt="Proof document preview"
                            className="max-h-48 w-full object-contain rounded-lg border border-zinc-700"
                        />
                    ) : (
                        // Show text for non-image files
                        <span className="text-white">{file?.name || "—"}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
