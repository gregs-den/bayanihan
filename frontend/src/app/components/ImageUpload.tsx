"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

type Props = {
    value: string;
    onChange: (url: string) => void;
};

export default function ImageUpload({ value, onChange }: Props) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    async function handleFileChange(e:React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError("");

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(fileName, file);
            
        if (uploadError) {
            setError("Upload failed: " + uploadError.message);
            setUploading(false);
            return;
        }

        const { data } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);

        onChange(data.publicUrl);
        setUploading(false);        
    }

    return (
        <div className="flex flex-col gap-2">
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="border rounded p-2"
            />
            {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {value && (
                <img src={value} alt="Preview" className="w-32 h-32 object-cover rounded border"/>
            )}
        </div>
    );
}