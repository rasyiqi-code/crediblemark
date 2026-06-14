"use client";

import { useState, useRef } from "react";
import { Plus, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/shared/utils";

interface DynamicListInputProps {
    name: string;
    defaultValue?: string[];
    placeholder?: string;
    className?: string;
}

export function DynamicListInput({ name, defaultValue = [], placeholder, className }: DynamicListInputProps) {
    const [items, setItems] = useState<string[]>(Array.isArray(defaultValue) ? defaultValue : []);
    const [newItem, setNewItem] = useState("");
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [isDraggable, setIsDraggable] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleAddItem = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const trimmed = newItem.trim();
        if (trimmed) {
            setItems([...items, trimmed]);
            setNewItem("");
            // Keep focus on input for rapid entry
            inputRef.current?.focus();
        }
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddItem();
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

        const reorderedItems = [...items];
        const draggedItem = reorderedItems[draggedIndex];
        reorderedItems.splice(draggedIndex, 1);
        reorderedItems.splice(index, 0, draggedItem);

        setDraggedIndex(index);
        setItems(reorderedItems);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setIsDraggable(false);
    };

    return (
        <div className={cn("space-y-3", className)}>
            {/* Hidden input for form submission */}
            <input type="hidden" name={name} value={items.join('\n')} />

            {/* List of items */}
            {items.length > 0 && (
                <ul className="space-y-2">
                    {items.map((item, index) => (
                        <li 
                            key={`${item}-${index}`}
                            draggable={isDraggable}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={cn(
                                "flex items-center gap-2 group animate-in fade-in slide-in-from-left-1 duration-200",
                                draggedIndex === index && "opacity-40 scale-[0.98] transition-all"
                            )}
                        >
                            <div className="flex-1 flex items-center gap-2 bg-zinc-900/40 border border-white/5 rounded-lg px-3 py-2 text-sm text-zinc-300">
                                <GripVertical 
                                    className="w-4 h-4 text-zinc-600 cursor-move opacity-50 active:text-blue-400 active:opacity-100 transition-all"
                                    onMouseDown={() => setIsDraggable(true)}
                                    onMouseUp={() => setIsDraggable(false)}
                                />
                                <span>{item}</span>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(index)}
                                className="h-9 w-9 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Input area */}
            <div className="flex gap-2">
                <Input
                    ref={inputRef}
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder || "Add a feature..."}
                    className="flex-1 bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-blue-500/20"
                />
                <Button
                    type="button"
                    onClick={() => handleAddItem()}
                    disabled={!newItem.trim()}
                    className="bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 border border-blue-600/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                </Button>
            </div>

            <p className="text-[10px] text-zinc-500">
                Press Enter to add item.
            </p>
        </div>
    );
}
