'use client'
import { useEffect } from "react";

export default function ImportJs() {
    useEffect(() => {
        import("bootstrap/dist/js/bootstrap.bundle.min.js").catch((error) => {
            console.error("Failed to load Bootstrap bundle:", error);
        });
    }, []);
    return null;
}