"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

type Props = {
    value: string[];
    onChange: (url: string[]) => void;
};

export default function ImageUpload({ value, onChange }: Props) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setError("");

        const newUrls: string[] = [];

        for (const file of Array.from(files)) {
            const fileExt = file.name.split(".").pop();    
            const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("product-images")
                .upload(fileName, file);

            if (uploadError) {
                setError("Upload failed: " + uploadError.message);
                continue;
            }
            const { data } = supabase.storage
                .from("product-images")
                .getPublicUrl(fileName);

            newUrls.push(data.publicUrl);
        }

        onChange([...value, ...newUrls]);
        setUploading(false);        
    }

    function handleRemove(url: string) {
        onChange(value.filter((u) => u !== url));
    }

    return (
        <div className="flex flex-col gap-2">
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="border rounded p-2"
            />
            {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {value.map((url) => (
                        <div key={url} className="relative">
                            <img   
                                src={url}
                                alt="Preview"
                                className="w-24 h-24 object-cover rounded border"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemove(url)}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
                            >
                                x
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}