export default function StepProof({ file, setFile }: any) {
    function handleChange(e: any) {
        setFile(e.target.files[0]);
    }

    function handleDrop(e: any) {
        e.preventDefault();
        setFile(e.dataTransfer.files[0]);
    }

    function removeFile() {
        setFile(null);
    }

    // Function to determine if file is an image
    function isImageFile(file: File | null): boolean {
        if (!file) return false;
        return file.type.startsWith("image/");
    }

    // Get file preview URL or placeholder
    function getFilePreview(): string {
        if (!file) return "";

        if (isImageFile(file)) {
            return URL.createObjectURL(file);
        }
        return ""; // Will use placeholder icon
    }

    if (file) {
        return (
            <div className="relative">
                {isImageFile(file) ? (
                    // Image Preview
                    <div className="group relative">
                        <img
                            src={getFilePreview()}
                            alt="Proof document preview"
                            className="max-h-64 w-full object-contain rounded-lg border border-zinc-700"
                        />

                        {/* Hover overlay with delete button */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <button
                                onClick={removeFile}
                                className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
                                title="Remove file"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                ) : (
                    // Non-image file preview (PDF, DOCX, etc.)
                    <div className="group relative">
                        <div className="flex flex-col items-center justify-center p-8 bg-zinc-800 rounded-lg border-2 border-zinc-700 hover:border-accent transition-colors">
                            <div className="w-16 h-16 bg-zinc-700 rounded-lg flex items-center justify-center mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-zinc-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <p className="text-zinc-300 font-medium">
                                {file.name}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                                {file.type}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>

                        {/* Hover overlay with delete button */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <button
                                onClick={removeFile}
                                className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
                                title="Remove file"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                <p className="mt-3 text-sm text-zinc-400 text-center">
                    Click to change or drag & drop to replace
                </p>

                {/* Hidden input for changing file */}
                <input
                    type="file"
                    name="proof-document"
                    accept=".pdf,.png,.jpg,.jpeg,.docx"
                    id="proof"
                    onChange={handleChange}
                    className="hidden"
                />

                {/* Clickable area to trigger file selection */}
                <label
                    htmlFor="proof"
                    className="cursor-pointer block"
                />
            </div>
        );
    }

    return (
        <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-zinc-700 rounded-xl p-10
               text-center hover:border-accent transition cursor-pointer"
        >
            <input
                type="file"
                name="proof-document"
                accept=".pdf,.png,.jpg,.jpeg,.docx"
                id="proof"
                onChange={handleChange}
                className="hidden"
            />

            <label
                htmlFor="proof"
                className="cursor-pointer block"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-zinc-500 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                </svg>
                <p className="text-zinc-300">
                    Drag & drop proof document, or{" "}
                    <span className="text-accent">browse</span>
                </p>
                <p className="text-xs text-zinc-500 mt-2">
                    PDF, image, or DOCX (Max 10MB)
                </p>
            </label>
        </div>
    );
}
