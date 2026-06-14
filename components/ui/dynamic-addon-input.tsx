"use client";

import { useState, useRef } from "react";
import { Plus, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/shared/utils";

export interface ServiceAddon {
    name: string;
    price: number;
    interval?: "one_time" | "monthly" | "yearly";
    currency?: "USD" | "IDR";
}

interface DynamicAddonInputProps {
    name: string;
    defaultValue?: ServiceAddon[];
    className?: string;
    currency?: string;
}

export function DynamicAddonInput({ name, defaultValue = [], className, currency = "USD" }: DynamicAddonInputProps) {
    const [addons, setAddons] = useState<ServiceAddon[]>(Array.isArray(defaultValue) ? defaultValue : []);
    const [newName, setNewName] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [newInterval, setNewInterval] = useState<"one_time" | "monthly" | "yearly">("one_time");
    const [newCurrency, setNewCurrency] = useState<"USD" | "IDR">("USD");
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [isDraggable, setIsDraggable] = useState(false);
    const nameRef = useRef<HTMLInputElement>(null);

    const handleAddAddon = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const trimmedName = newName.trim();
        const parsedPrice = parseFloat(newPrice);

        if (trimmedName && !isNaN(parsedPrice) && parsedPrice >= 0) {
            setAddons([...addons, { name: trimmedName, price: parsedPrice, interval: newInterval, currency: newCurrency }]);
            setNewName("");
            setNewPrice("");
            setNewInterval("one_time");
            setNewCurrency("USD");
            nameRef.current?.focus();
        }
    };

    const handleRemoveAddon = (index: number) => {
        setAddons(addons.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddAddon();
        }
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index.toString());
    };

    const handleDragOver = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const reorderedAddons = [...addons];
        const draggedItem = reorderedAddons[draggedIndex];
        reorderedAddons.splice(draggedIndex, 1);
        reorderedAddons.splice(index, 0, draggedItem);

        setDraggedIndex(index);
        setAddons(reorderedAddons);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setIsDraggable(false);
    };

    return (
        <div className={cn("space-y-3", className)}>
            <input type="hidden" name={name} value={JSON.stringify(addons)} />

            {addons.length > 0 && (
                <ul className="space-y-2">
                    {addons.map((addon, index) => (
                        <li 
                            key={`${addon.name}-${index}`}
                            draggable={isDraggable}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={cn(
                                "flex items-center gap-2 group animate-in fade-in slide-in-from-left-1 duration-200",
                                draggedIndex === index && "opacity-40 scale-[0.98] transition-all"
                            )}
                        >
                            <div className="flex-1 flex items-center justify-between gap-2 bg-zinc-900/40 border border-white/5 rounded-lg px-3 py-2 text-sm text-zinc-300">
                                <div className="flex items-center gap-2">
                                    <GripVertical 
                                        className="w-4 h-4 text-zinc-600 cursor-move opacity-50 active:text-blue-400 active:opacity-100 transition-all"
                                        onMouseDown={() => setIsDraggable(true)}
                                        onMouseUp={() => setIsDraggable(false)}
                                    />
                                    <div className="flex flex-col">
                                        <span>{addon.name}</span>
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                            {addon.interval === "monthly" ? "Monthly" : addon.interval === "yearly" ? "Yearly" : "One-time"}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-zinc-400 font-medium">
                                    {(addon.currency || currency) === "IDR" ? `Rp ${Number(addon.price || 0).toLocaleString("id-ID")}` : `$${Number(addon.price || 0).toFixed(2)}`}
                                </span>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveAddon(index)}
                                className="h-9 w-9 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-[3] flex gap-2">
                    <Input
                        ref={nameRef}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add-on name..."
                        className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-blue-500/20"
                    />
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Price"
                        className="w-24 bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-blue-500/20"
                    />
                    <Select value={newCurrency} onValueChange={(val: "USD" | "IDR") => setNewCurrency(val)}>
                        <SelectTrigger className="w-[80px] bg-black/20 border-white/10 text-zinc-200 focus:ring-blue-500/20 h-10 text-xs rounded-md">
                            <SelectValue placeholder="Curr" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-zinc-200">
                            <SelectItem value="USD" className="text-xs">USD</SelectItem>
                            <SelectItem value="IDR" className="text-xs">IDR</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1 flex gap-2">
                    <Select value={newInterval} onValueChange={(val: "one_time" | "monthly" | "yearly") => setNewInterval(val)}>
                        <SelectTrigger className="w-[110px] bg-black/20 border-white/10 text-zinc-200 focus:ring-blue-500/20 h-10 text-xs rounded-md">
                            <SelectValue placeholder="Interval" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-zinc-200">
                            <SelectItem value="one_time" className="text-xs">One-time</SelectItem>
                            <SelectItem value="monthly" className="text-xs">Monthly</SelectItem>
                            <SelectItem value="yearly" className="text-xs">Yearly</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        type="button"
                        onClick={() => handleAddAddon()}
                        disabled={!newName.trim() || newPrice === ""}
                        className="bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 border border-blue-600/20 px-3"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                    </Button>
                </div>
            </div>
            <p className="text-[10px] text-zinc-500">
                Press Enter on either field to add item.
            </p>
        </div>
    );
}
