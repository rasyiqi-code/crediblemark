"use client";

import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
} from "@tanstack/react-table";
import { useTableInstance } from "@/lib/shared/table-instance";
import { useProjectPagination } from "@/lib/shared/hooks/use-project-pagination";
import { AdminLoadMoreButton } from "@/components/admin/shared/admin-load-more-button";

interface ProjectsDataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    totalCount: number;
    query?: string;
    status?: string;
}

export function ProjectsDataTable<TData, TValue>({
    columns,
    data: initialData,
    totalCount,
    query,
    status,
}: ProjectsDataTableProps<TData, TValue>) {
    // Logika paginasi di-handle oleh hook bersama
    const { data, hasMore, isLoading, loadMore } = useProjectPagination({
        initialData,
        totalCount,
        query,
        status,
    });

    const table = useTableInstance({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        columnResizeMode: "onChange",
        defaultColumn: {
            minSize: 0,
            maxSize: 1000,
        },
    });

    return (
        <div className="w-full max-w-full overflow-hidden">
            <div className="rounded-xl border border-zinc-800/50 bg-[#09090b] relative overflow-hidden">
                <div className="overflow-x-auto w-full 
                    [&::-webkit-scrollbar]:h-1.5 
                    [&::-webkit-scrollbar-track]:bg-transparent 
                    [&::-webkit-scrollbar-thumb]:bg-zinc-800/50 
                    [&::-webkit-scrollbar-thumb]:rounded-full 
                    hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700/80
                    transition-colors"
                >
                    <table
                        className="border-separate border-spacing-0 table-fixed w-full min-w-[1000px] text-sm"
                    >
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const isActions = header.column.id === 'actions';
                                        const isTitle = header.column.id === 'title';
                                        // size used to be here

                                        let headerClasses = "h-10 px-2 text-left align-middle font-bold text-zinc-400 bg-zinc-950 border-b border-zinc-800 relative group transition-colors hover:bg-zinc-900 sticky top-0 z-40";

                                        if (isTitle) {
                                            headerClasses = "h-10 px-2 text-left align-middle font-bold text-zinc-400 bg-zinc-950 border-b border-zinc-800 relative group transition-colors hover:bg-zinc-900 sticky top-0 left-0 z-50 border-r border-zinc-800 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.5)]";
                                        } else if (isActions) {
                                            headerClasses = "h-10 text-center align-middle font-bold text-zinc-400 bg-zinc-950 border-b border-zinc-800 relative group transition-colors hover:bg-zinc-900 sticky top-0 right-0 z-50 border-l border-zinc-800 shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.5)]";
                                        } else {
                                            headerClasses += " border-r border-zinc-800/50";
                                        }

                                        return (
                                            <th
                                                key={header.id}
                                                className={headerClasses}
                                                style={{
                                                    width: header.getSize(),
                                                }}
                                            >
                                                <div className={`uppercase text-[10px] tracking-wider whitespace-nowrap overflow-hidden ${isActions ? "flex justify-center px-1" : "px-1"}`}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </div>

                                                {/* Resizer Handle */}
                                                {!isActions && header.column.getCanResize() && (
                                                    <div
                                                        onMouseDown={header.getResizeHandler()}
                                                        onTouchStart={header.getResizeHandler()}
                                                        className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none bg-transparent hover:bg-[#cd1717] active:bg-[#a50f0f] transition-colors z-[60]
                                                            ${header.column.getIsResizing() ? "bg-[#cd1717] w-[2px]" : ""}`}
                                                    />
                                                )}
                                            </th>
                                        );
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="bg-transparent">
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="group transition-colors hover:bg-zinc-900/30"
                                    >
                                        {row.getVisibleCells().map((cell) => {
                                            const isActions = cell.column.id === 'actions';
                                            const isTitle = cell.column.id === 'title';
                                            // size used to be here

                                            let cellClasses = "h-12 px-2 align-middle border-b border-zinc-800/50 relative overflow-hidden transition-colors z-10 bg-transparent";

                                            if (isTitle) {
                                                cellClasses = "h-12 px-2 align-middle border-b border-zinc-800/50 relative overflow-hidden transition-colors sticky left-0 z-30 bg-zinc-950 group-hover:bg-[#111113] border-r border-zinc-800 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.5)]";
                                            } else if (isActions) {
                                                cellClasses = "h-12 px-2 align-middle border-b border-zinc-800 border-zinc-800/50 relative overflow-hidden transition-colors sticky right-0 z-30 bg-zinc-950 group-hover:bg-[#111113] border-l border-zinc-800 shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.5)]";
                                            } else {
                                                cellClasses += " border-r border-zinc-800/50";
                                            }

                                            return (
                                                <td
                                                    key={cell.id}
                                                    className={cellClasses}
                                                    style={{
                                                        width: cell.column.getSize(),
                                                    }}
                                                >
                                                    <div className={`leading-snug px-1 truncate ${isActions ? "flex justify-center" : ""}`}>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="h-32 text-center align-middle text-zinc-600 border-b border-zinc-800/50"
                                    >
                                        No projects found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {hasMore && (
                    <AdminLoadMoreButton isLoading={isLoading} onClick={loadMore} />
                )}
            </div>
        </div>
    );
}
