import { useState, useRef, useEffect } from "react";
import { cn } from "../utils/helpers";

interface ImageUploadProps {
    onFileChange: (file: File | null) => void;
    previewUrl?: string;
    label?: string;
    accept?: string;
    maxSize?: number;
    name?: string;
}

export default function ImageUpload({
    onFileChange,
    previewUrl,
    label = "Upload Image",
    accept = "image/*",
    maxSize = 10,
    name = "",
}: ImageUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (previewUrl) {
            setPreview(previewUrl);
        } else if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreview(null);
        }
    }, [file, previewUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setError(null);

        if (selectedFile) {
            // Validate file type
            if (!selectedFile.type.startsWith("image/")) {
                setError("Please select an image file");
                onFileChange(null);
                return;
            }

            // Validate file size
            const sizeInMB = selectedFile.size / (1024 * 1024);
            if (sizeInMB > maxSize) {
                setError(`File size must be less than ${maxSize}MB`);
                onFileChange(null);
                return;
            }

            setFile(selectedFile);
            onFileChange(selectedFile);
        } else {
            setFile(null);
            onFileChange(null);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files?.[0] || null;

        if (droppedFile) {
            const fakeEvent = {
                target: { files: [droppedFile] },
            } as unknown as React.ChangeEvent<HTMLInputElement>;

            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(droppedFile);

            const event = {
                target: { files: dataTransfer.files },
            } as React.ChangeEvent<HTMLInputElement>;

            handleFileChange(event);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const removeFile = () => {
        setFile(null);
        setPreview(null);
        setError(null);
        onFileChange(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-2">
            <label className="block ml-1">{label}</label>

            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                    error
                        ? "border-red-500 bg-red-500/10"
                        : preview
                        ? "border-accent bg-accent/5"
                        : "border-zinc-700 hover:border-accent"
                )}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={accept}
                    className="hidden"
                    name={name}
                />

                {preview ? (
                    <div className="relative group">
                        <img
                            src={preview}
                            alt="Preview"
                            className="max-h-64 w-full object-contain rounded-lg"
                        />

                        {/* delete overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <button
                                type="button"
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
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="space-y-4"
                    >
                        <div className="w-12 h-12 mx-auto bg-zinc-800 rounded-full flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-zinc-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                            </svg>
                        </div>
                        <p className="text-zinc-400">
                            Drag & drop your banner image, or{" "}
                            <span className="text-accent underline">
                                browse
                            </span>
                        </p>
                        <p className="text-xs text-zinc-500">
                            PNG, JPG, GIF up to {maxSize}MB
                        </p>
                    </div>
                )}
            </div>

            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>
    );
}
