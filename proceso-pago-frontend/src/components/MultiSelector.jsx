"use client";

import { useState, useRef, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";

function MultiSelector({ items = [], value = [], onChange }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleItem = (itemValue) => {
        const newValue = value.includes(itemValue)
            ? value.filter((v) => v !== itemValue)
            : [...value, itemValue];
        onChange(newValue);
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Botón trigger */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full justify-between flex items-center border rounded-md px-3 py-2 text-sm bg-white hover:bg-gray-50 focus:outline-none"
            >
                <span className="truncate">
                    {value.length > 0 ? value.join(", ") : "Selecciona opciones"}
                </span>
                <span className="ml-2">▾</span>
            </button>

            {/* Menú desplegable */}
            {open && (
                <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg p-2 max-h-60 overflow-y-auto">
                    <div className="flex flex-col gap-1">
                        {items.map((item) => (
                            <label key={item} className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={value.includes(item)}
                                    onCheckedChange={() => toggleItem(item)}
                                />
                                {item}
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MultiSelector;