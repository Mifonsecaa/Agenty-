(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/dashboard/tools/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ToolsStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/credit-card.js [app-client] (ecmascript) <export default as CreditCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.js [app-client] (ecmascript) <export default as ShoppingBag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mail.js [app-client] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$blocks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Blocks$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/blocks.js [app-client] (ecmascript) <export default as Blocks>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$spreadsheet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileSpreadsheet$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-spreadsheet.js [app-client] (ecmascript) <export default as FileSpreadsheet>");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AgentyContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/AgentyContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$ActionConfirmationPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/dashboard/ActionConfirmationPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$dashboardCopy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/dashboard/dashboardCopy.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function isSpreadsheetFile(fileName, fileType) {
    if (/\.(xlsx|xlsm)$/i.test(fileName)) return true;
    return [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel.sheet.macroEnabled.12"
    ].includes(fileType || "");
}
function ExcelViewerModal({ files, loadingFiles, loadingPreview, preview, selectedFile, savingCell, onClose, onSelectFile, onEditCell }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/15 bg-[#090b12]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-5 py-4 border-b border-white/10 flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-lg font-semibold text-white flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$spreadsheet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileSpreadsheet$3e$__["FileSpreadsheet"], {
                                    className: "w-5 h-5 text-emerald-400"
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/tools/page.tsx",
                                    lineNumber: 75,
                                    columnNumber: 25
                                }, this),
                                "Visor Excel (.xlsx / .xlsm)"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/dashboard/tools/page.tsx",
                            lineNumber: 74,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "text-white/60 hover:text-white",
                            children: "Cerrar"
                        }, void 0, false, {
                            fileName: "[project]/app/dashboard/tools/page.tsx",
                            lineNumber: 78,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/dashboard/tools/page.tsx",
                    lineNumber: 73,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 lg:grid-cols-3 min-h-[65vh]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                            className: "border-r border-white/10 p-4 overflow-y-auto",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-white/50 mb-3",
                                    children: "Archivos subidos por el usuario"
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/tools/page.tsx",
                                    lineNumber: 83,
                                    columnNumber: 25
                                }, this),
                                loadingFiles ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-white/60",
                                    children: "Cargando archivos..."
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/tools/page.tsx",
                                    lineNumber: 85,
                                    columnNumber: 29
                                }, this) : files.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-white/60",
                                    children: "No hay archivos Excel en tu base de conocimiento."
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/tools/page.tsx",
                                    lineNumber: 87,
                                    columnNumber: 29
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: files.map((file)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>onSelectFile(file),
                                            className: `w-full text-left rounded-lg px-3 py-2 border transition-colors ${selectedFile === file.fileUrl ? "border-emerald-400/60 bg-emerald-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-white truncate",
                                                    children: file.fileName
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/tools/page.tsx",
                                                    lineNumber: 96,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[11px] text-white/50 truncate",
                                                    children: file.fileType || "spreadsheet"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/tools/page.tsx",
                                                    lineNumber: 97,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, file.fileUrl, true, {
                                            fileName: "[project]/app/dashboard/tools/page.tsx",
                                            lineNumber: 91,
                                            columnNumber: 37
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/tools/page.tsx",
                                    lineNumber: 89,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/dashboard/tools/page.tsx",
                            lineNumber: 82,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            className: "lg:col-span-2 p-4 overflow-y-auto",
                            children: loadingPreview ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-white/60",
                                children: "Cargando previsualizacion..."
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                lineNumber: 106,
                                columnNumber: 29
                            }, this) : !preview ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-white/60",
                                children: "Selecciona un archivo para abrir el visor."
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                lineNumber: 108,
                                columnNumber: 29
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                className: "text-sm text-white/80",
                                                children: preview.fileName
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                                lineNumber: 112,
                                                columnNumber: 37
                                            }, this),
                                            preview.modifiedAt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[11px] text-white/50",
                                                children: [
                                                    "Actualizado: ",
                                                    new Date(preview.modifiedAt).toLocaleString()
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                                lineNumber: 114,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/tools/page.tsx",
                                        lineNumber: 111,
                                        columnNumber: 33
                                    }, this),
                                    preview.sheets.map((sheet)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "border border-white/10 rounded-xl overflow-hidden",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "px-3 py-2 text-xs bg-white/5 text-white/70 flex justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                "Hoja: ",
                                                                sheet.name
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/dashboard/tools/page.tsx",
                                                            lineNumber: 120,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                sheet.rowCount,
                                                                " filas"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/dashboard/tools/page.tsx",
                                                            lineNumber: 121,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/dashboard/tools/page.tsx",
                                                    lineNumber: 119,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "overflow-auto",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                                        className: "min-w-full text-xs",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                                className: "bg-white/5",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                    children: sheet.headers.slice(0, 18).map((header, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                            className: "px-2 py-1 text-left text-white/70 whitespace-nowrap border-b border-white/10",
                                                                            children: header
                                                                        }, `${sheet.name}-h-${idx}`, false, {
                                                                            fileName: "[project]/app/dashboard/tools/page.tsx",
                                                                            lineNumber: 128,
                                                                            columnNumber: 61
                                                                        }, this))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/dashboard/tools/page.tsx",
                                                                    lineNumber: 126,
                                                                    columnNumber: 53
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                                                lineNumber: 125,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                                children: sheet.rows.slice(0, 80).map((row, rowIdx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                        className: "border-b border-white/5",
                                                                        children: sheet.headers.slice(0, 18).map((_, colIdx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                className: "px-2 py-1 text-white/80 whitespace-nowrap",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    className: "w-full text-left hover:bg-white/10 rounded px-1 py-0.5 disabled:opacity-50",
                                                                                    disabled: savingCell,
                                                                                    onClick: ()=>onEditCell({
                                                                                            sheetName: sheet.name,
                                                                                            rowIndex: rowIdx + 1,
                                                                                            colIndex: colIdx,
                                                                                            currentValue: row[colIdx] || ""
                                                                                        }),
                                                                                    children: row[colIdx] || ""
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/dashboard/tools/page.tsx",
                                                                                    lineNumber: 139,
                                                                                    columnNumber: 69
                                                                                }, this)
                                                                            }, `${sheet.name}-c-${rowIdx}-${colIdx}`, false, {
                                                                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                                                                lineNumber: 138,
                                                                                columnNumber: 65
                                                                            }, this))
                                                                    }, `${sheet.name}-r-${rowIdx}`, false, {
                                                                        fileName: "[project]/app/dashboard/tools/page.tsx",
                                                                        lineNumber: 136,
                                                                        columnNumber: 57
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                                                lineNumber: 134,
                                                                columnNumber: 49
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/dashboard/tools/page.tsx",
                                                        lineNumber: 124,
                                                        columnNumber: 45
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/tools/page.tsx",
                                                    lineNumber: 123,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, sheet.name, true, {
                                            fileName: "[project]/app/dashboard/tools/page.tsx",
                                            lineNumber: 118,
                                            columnNumber: 37
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                lineNumber: 110,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/dashboard/tools/page.tsx",
                            lineNumber: 104,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/dashboard/tools/page.tsx",
                    lineNumber: 81,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/dashboard/tools/page.tsx",
            lineNumber: 72,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/dashboard/tools/page.tsx",
        lineNumber: 71,
        columnNumber: 9
    }, this);
}
_c = ExcelViewerModal;
function ToolsStore() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const copy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$dashboardCopy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDashboardCopy"])(searchParams.get("lang") || undefined);
    const { activeAgent, saveAgent, updateActiveAgentConfig } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AgentyContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAgenty"])();
    const [tools, setTools] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        {
            id: 1,
            slug: "google-calendar",
            name: "Google Calendar",
            description: "Permite a tu agente revisar disponibilidad y agendar citas automáticamente.",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                className: "w-6 h-6 text-blue-400"
            }, void 0, false, {
                fileName: "[project]/app/dashboard/tools/page.tsx",
                lineNumber: 180,
                columnNumber: 19
            }, this),
            status: "connected",
            category: "Productividad"
        },
        {
            id: 2,
            slug: "payments",
            name: "MercadoPago / Wompi",
            description: "Genera links de pago y verifica si el cliente ya pagó la orden.",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"], {
                className: "w-6 h-6 text-emerald-400"
            }, void 0, false, {
                fileName: "[project]/app/dashboard/tools/page.tsx",
                lineNumber: 189,
                columnNumber: 19
            }, this),
            status: "disconnected",
            category: "Ventas"
        },
        {
            id: 3,
            slug: "shopify",
            name: "Shopify Inventory",
            description: "Conecta tu catálogo para que el agente vea el stock en tiempo real.",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__["ShoppingBag"], {
                className: "w-6 h-6 text-purple-400"
            }, void 0, false, {
                fileName: "[project]/app/dashboard/tools/page.tsx",
                lineNumber: 198,
                columnNumber: 19
            }, this),
            status: "disconnected",
            category: "E-Commerce"
        },
        {
            id: 4,
            slug: "email",
            name: "Gmail / Outlook",
            description: "Envía correos electrónicos con cotizaciones a petición del cliente.",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                className: "w-6 h-6 text-rose-400"
            }, void 0, false, {
                fileName: "[project]/app/dashboard/tools/page.tsx",
                lineNumber: 207,
                columnNumber: 19
            }, this),
            status: "disconnected",
            category: "Productividad"
        },
        {
            id: 5,
            slug: "knowledge-excel-viewer",
            name: "Visor Excel KB",
            description: "Visualiza en modo lectura archivos .xlsx y .xlsm que tu usuario sube a la base de conocimiento.",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$spreadsheet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileSpreadsheet$3e$__["FileSpreadsheet"], {
                className: "w-6 h-6 text-emerald-300"
            }, void 0, false, {
                fileName: "[project]/app/dashboard/tools/page.tsx",
                lineNumber: 216,
                columnNumber: 19
            }, this),
            status: "connected",
            category: "Knowledge"
        }
    ]);
    const [savingToolId, setSavingToolId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [statusMessage, setStatusMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pendingDeactivateToolId, setPendingDeactivateToolId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [excelViewerOpen, setExcelViewerOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [excelFiles, setExcelFiles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loadingExcelFiles, setLoadingExcelFiles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedExcelFileUrl, setSelectedExcelFileUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [excelPreview, setExcelPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loadingExcelPreview, setLoadingExcelPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [savingExcelCell, setSavingExcelCell] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Leer tools recomendadas desde el contexto
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ToolsStore.useEffect": ()=>{
            if (!activeAgent) return;
            const config = activeAgent.config || activeAgent;
            if (config.recommendedTools && Array.isArray(config.recommendedTools)) {
                setTools({
                    "ToolsStore.useEffect": (prevTools)=>prevTools.map({
                            "ToolsStore.useEffect": (tool)=>({
                                    ...tool,
                                    status: tool.slug === "knowledge-excel-viewer" ? "connected" : config.recommendedTools.includes(tool.id) ? "connected" : "disconnected"
                                })
                        }["ToolsStore.useEffect"])
                }["ToolsStore.useEffect"]);
            }
        }
    }["ToolsStore.useEffect"], [
        activeAgent
    ]);
    const handleToggleTool = async (toolId)=>{
        if (!activeAgent || savingToolId !== null) return;
        setStatusMessage(null);
        setSavingToolId(toolId);
        const previousTools = tools;
        const nextTools = previousTools.map((tool)=>{
            if (tool.id !== toolId) return tool;
            return {
                ...tool,
                status: tool.status === "connected" ? "disconnected" : "connected"
            };
        });
        // Optimistic update para respuesta inmediata en UI
        setTools(nextTools);
        const recommendedTools = nextTools.filter((tool)=>tool.status === "connected").map((tool)=>tool.id);
        const currentConfig = activeAgent.config || {};
        const mergedConfig = {
            ...currentConfig,
            recommendedTools
        };
        const saved = await saveAgent(activeAgent.id, activeAgent.name, mergedConfig);
        if (!saved) {
            // Rollback si falla persistencia
            setTools(previousTools);
            setStatusMessage({
                type: "error",
                text: copy.tools.updateError
            });
            setSavingToolId(null);
            return;
        }
        updateActiveAgentConfig({
            config: mergedConfig
        });
        setStatusMessage({
            type: "success",
            text: copy.tools.updateSuccess
        });
        setSavingToolId(null);
    };
    const handlePrimaryAction = (tool)=>{
        if (tool.slug === "knowledge-excel-viewer") {
            void openExcelViewer();
            return;
        }
        if (tool.status === "connected") {
            const configTargetBySlug = {
                "google-calendar": "/dashboard/settings?tab=integrations&tool=google-calendar",
                "payments": "/dashboard/settings?tab=integrations&tool=payments",
                "shopify": "/dashboard/knowledge",
                "email": "/dashboard/settings?tab=integrations&tool=email",
                "knowledge-excel-viewer": "/dashboard/tools"
            };
            const target = configTargetBySlug[tool.slug];
            setStatusMessage({
                type: "success",
                text: copy.tools.openingConfig(tool.name)
            });
            router.push(target);
            return;
        }
        handleToggleTool(tool.id);
    };
    const openExcelViewer = async ()=>{
        if (!activeAgent?.id) return;
        setExcelViewerOpen(true);
        setLoadingExcelFiles(true);
        setExcelPreview(null);
        setSelectedExcelFileUrl(null);
        try {
            const res = await fetch(`/api/knowledge?businessId=${activeAgent.id}`);
            const data = await res.json();
            const items = data?.data?.items || data?.items || [];
            const seen = new Set();
            const files = [];
            for (const item of items){
                const fileUrl = item?.metadata?.fileUrl;
                const fileName = item?.metadata?.fileName || "archivo.xlsx";
                const fileType = item?.metadata?.fileType || "";
                if (!fileUrl || seen.has(fileUrl)) continue;
                if (!isSpreadsheetFile(fileName, fileType)) continue;
                seen.add(fileUrl);
                files.push({
                    fileUrl,
                    fileName,
                    fileType
                });
            }
            setExcelFiles(files);
            if (files[0]) {
                void loadExcelPreview(files[0]);
            }
        } catch (error) {
            console.error("[ToolsStore] Error loading excel files:", error);
            setStatusMessage({
                type: "error",
                text: "No se pudieron cargar archivos Excel de la base de conocimiento."
            });
        } finally{
            setLoadingExcelFiles(false);
        }
    };
    const loadExcelPreview = async (file)=>{
        if (!activeAgent?.id) return;
        setSelectedExcelFileUrl(file.fileUrl);
        setLoadingExcelPreview(true);
        try {
            const params = new URLSearchParams({
                businessId: activeAgent.id,
                fileUrl: file.fileUrl
            });
            const res = await fetch(`/api/knowledge/preview?${params.toString()}`);
            const data = await res.json();
            if (!res.ok || !data.success || !data.data) {
                setStatusMessage({
                    type: "error",
                    text: data.error || "No se pudo abrir el archivo Excel."
                });
                setExcelPreview(null);
                return;
            }
            setExcelPreview(data.data);
        } catch (error) {
            console.error("[ToolsStore] Error loading excel preview:", error);
            setStatusMessage({
                type: "error",
                text: error.message || "No se pudo abrir el archivo Excel."
            });
            setExcelPreview(null);
        } finally{
            setLoadingExcelPreview(false);
        }
    };
    const handleEditExcelCell = async (params)=>{
        if (!activeAgent?.id || !selectedExcelFileUrl || savingExcelCell) return;
        const nextValue = window.prompt(`Editar celda ${params.sheetName}!${params.colIndex + 1}:${params.rowIndex + 1}`, params.currentValue || "");
        if (nextValue === null) return;
        setSavingExcelCell(true);
        try {
            const res = await fetch("/api/knowledge/preview", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    businessId: activeAgent.id,
                    fileUrl: selectedExcelFileUrl,
                    edits: [
                        {
                            sheetName: params.sheetName,
                            rowIndex: params.rowIndex,
                            colIndex: params.colIndex,
                            value: nextValue
                        }
                    ]
                })
            });
            const data = await res.json().catch(()=>({}));
            if (!res.ok) {
                setStatusMessage({
                    type: "error",
                    text: data.error || "No se pudo guardar la celda"
                });
                return;
            }
            setStatusMessage({
                type: "success",
                text: "Celda guardada y conocimiento reindexado."
            });
            const targetFile = excelFiles.find((file)=>file.fileUrl === selectedExcelFileUrl);
            if (targetFile) {
                await loadExcelPreview(targetFile);
            }
        } catch (error) {
            console.error("[ToolsStore] Error editing excel cell:", error);
            setStatusMessage({
                type: "error",
                text: "No se pudo actualizar el archivo Excel."
            });
        } finally{
            setSavingExcelCell(false);
        }
    };
    const openDeactivateConfirm = (toolId)=>{
        if (savingToolId !== null) return;
        setPendingDeactivateToolId(toolId);
    };
    const closeDeactivateConfirm = ()=>{
        if (savingToolId !== null) return;
        setPendingDeactivateToolId(null);
    };
    const confirmDeactivateTool = async ()=>{
        if (pendingDeactivateToolId === null) return;
        await handleToggleTool(pendingDeactivateToolId);
        setPendingDeactivateToolId(null);
    };
    const pendingDeactivateTool = tools.find((tool)=>tool.id === pendingDeactivateToolId) || null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-6xl mx-auto space-y-8 relative z-10",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-3xl font-bold tracking-tight mb-2 flex items-center gap-3",
                        children: [
                            "Tools Store ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$blocks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Blocks$3e$__["Blocks"], {
                                className: "w-6 h-6 text-purple-400"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                lineNumber: 458,
                                columnNumber: 33
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/tools/page.tsx",
                        lineNumber: 457,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-white/60",
                        children: 'Instala "habilidades" (Function Calling) en tu agente con un solo clic.'
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/tools/page.tsx",
                        lineNumber: 460,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/tools/page.tsx",
                lineNumber: 456,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6",
                children: tools.map((tool)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-white/20 transition-all",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-start mb-4 relative z-10",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-3 rounded-xl bg-white/5 border border-white/10",
                                        children: tool.icon
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/tools/page.tsx",
                                        lineNumber: 468,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-bold uppercase tracking-wider text-white/40 bg-white/5 px-2 py-1 rounded-md",
                                        children: tool.category
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/tools/page.tsx",
                                        lineNumber: 471,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                lineNumber: 467,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xl font-bold mb-2 relative z-10",
                                children: tool.name
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                lineNumber: 476,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-white/50 mb-6 min-h-10 relative z-10",
                                children: tool.description
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                lineNumber: 477,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "pt-4 border-t border-white/10 flex justify-between items-center relative z-10",
                                children: [
                                    tool.status === "connected" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 text-sm text-emerald-400 font-medium",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                                lineNumber: 484,
                                                columnNumber: 37
                                            }, this),
                                            "Activado"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/tools/page.tsx",
                                        lineNumber: 483,
                                        columnNumber: 33
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 text-sm text-white/40 font-medium",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-2 h-2 rounded-full bg-white/20"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                                lineNumber: 489,
                                                columnNumber: 37
                                            }, this),
                                            "Desactivado"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/tools/page.tsx",
                                        lineNumber: 488,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tool.status === 'connected' ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10' : 'bg-white text-black hover:bg-white/90'} ${savingToolId === tool.id ? 'opacity-70 cursor-wait' : ''}`,
                                        onClick: ()=>handlePrimaryAction(tool),
                                        disabled: savingToolId !== null,
                                        children: savingToolId === tool.id ? tool.status === "connected" ? "Guardando..." : "Conectando..." : tool.status === "connected" ? "Configurar" : "Conectar"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/tools/page.tsx",
                                        lineNumber: 494,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                lineNumber: 481,
                                columnNumber: 25
                            }, this),
                            tool.status === "connected" && tool.slug !== "knowledge-excel-viewer" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>openDeactivateConfirm(tool.id),
                                disabled: savingToolId !== null,
                                className: "mt-3 text-xs text-white/40 hover:text-red-400 transition-colors disabled:opacity-50",
                                children: "Desactivar"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                lineNumber: 508,
                                columnNumber: 29
                            }, this),
                            tool.status === "connected" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/tools/page.tsx",
                                lineNumber: 519,
                                columnNumber: 29
                            }, this)
                        ]
                    }, tool.id, true, {
                        fileName: "[project]/app/dashboard/tools/page.tsx",
                        lineNumber: 465,
                        columnNumber: 21
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/dashboard/tools/page.tsx",
                lineNumber: 463,
                columnNumber: 13
            }, this),
            pendingDeactivateTool && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$ActionConfirmationPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                message: copy.tools.deactivateConfirm(pendingDeactivateTool.name),
                details: copy.tools.deactivateDetails,
                confirmLabel: copy.confirmation.labels.deactivate,
                cancelLabel: copy.confirmation.cancel,
                isLoading: savingToolId === pendingDeactivateTool.id,
                onCancel: closeDeactivateConfirm,
                onConfirm: ()=>{
                    void confirmDeactivateTool();
                }
            }, void 0, false, {
                fileName: "[project]/app/dashboard/tools/page.tsx",
                lineNumber: 526,
                columnNumber: 17
            }, this),
            statusMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: `text-sm ${statusMessage.type === "success" ? "text-emerald-400" : "text-red-400"}`,
                children: statusMessage.text
            }, void 0, false, {
                fileName: "[project]/app/dashboard/tools/page.tsx",
                lineNumber: 540,
                columnNumber: 17
            }, this),
            excelViewerOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ExcelViewerModal, {
                files: excelFiles,
                loadingFiles: loadingExcelFiles,
                loadingPreview: loadingExcelPreview,
                preview: excelPreview,
                selectedFile: selectedExcelFileUrl,
                savingCell: savingExcelCell,
                onClose: ()=>setExcelViewerOpen(false),
                onSelectFile: (file)=>{
                    void loadExcelPreview(file);
                },
                onEditCell: (params)=>{
                    void handleEditExcelCell(params);
                }
            }, void 0, false, {
                fileName: "[project]/app/dashboard/tools/page.tsx",
                lineNumber: 546,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/dashboard/tools/page.tsx",
        lineNumber: 453,
        columnNumber: 9
    }, this);
}
_s(ToolsStore, "gxeoXf4f5HRHJWPhzRSNB5Dyuhc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AgentyContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAgenty"]
    ];
});
_c1 = ToolsStore;
var _c, _c1;
__turbopack_context__.k.register(_c, "ExcelViewerModal");
__turbopack_context__.k.register(_c1, "ToolsStore");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Calendar
]);
/**
 * @license lucide-react v0.576.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M8 2v4",
            key: "1cmpym"
        }
    ],
    [
        "path",
        {
            d: "M16 2v4",
            key: "4m81vk"
        }
    ],
    [
        "rect",
        {
            width: "18",
            height: "18",
            x: "3",
            y: "4",
            rx: "2",
            key: "1hopcy"
        }
    ],
    [
        "path",
        {
            d: "M3 10h18",
            key: "8toen8"
        }
    ]
];
const Calendar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("calendar", __iconNode);
;
 //# sourceMappingURL=calendar.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Calendar",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ShoppingBag
]);
/**
 * @license lucide-react v0.576.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M16 10a4 4 0 0 1-8 0",
            key: "1ltviw"
        }
    ],
    [
        "path",
        {
            d: "M3.103 6.034h17.794",
            key: "awc11p"
        }
    ],
    [
        "path",
        {
            d: "M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z",
            key: "o988cm"
        }
    ]
];
const ShoppingBag = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("shopping-bag", __iconNode);
;
 //# sourceMappingURL=shopping-bag.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.js [app-client] (ecmascript) <export default as ShoppingBag>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ShoppingBag",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/file-spreadsheet.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>FileSpreadsheet
]);
/**
 * @license lucide-react v0.576.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
            key: "1oefj6"
        }
    ],
    [
        "path",
        {
            d: "M14 2v5a1 1 0 0 0 1 1h5",
            key: "wfsgrz"
        }
    ],
    [
        "path",
        {
            d: "M8 13h2",
            key: "yr2amv"
        }
    ],
    [
        "path",
        {
            d: "M14 13h2",
            key: "un5t4a"
        }
    ],
    [
        "path",
        {
            d: "M8 17h2",
            key: "2yhykz"
        }
    ],
    [
        "path",
        {
            d: "M14 17h2",
            key: "10kma7"
        }
    ]
];
const FileSpreadsheet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("file-spreadsheet", __iconNode);
;
 //# sourceMappingURL=file-spreadsheet.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/file-spreadsheet.js [app-client] (ecmascript) <export default as FileSpreadsheet>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FileSpreadsheet",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$spreadsheet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$spreadsheet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-spreadsheet.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=_07d5dc56._.js.map