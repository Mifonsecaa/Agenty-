import { Annotation, END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { AIMessage, BaseMessage, SystemMessage } from "@langchain/core/messages";
import { retrieveRagContext } from "@/lib/rag/retriever";
import { brainModel, reservationExtractorModel, spreadsheetExecutorRequestModel } from "@/lib/ai";
import { processExcelWorkOrder } from "../tools/excel-handler";
import { createSpreadsheetUpdateTool, listSpreadsheetFilesForBusiness } from "../tools/knowledge-tool";
import { getGraphCheckpointer } from "./checkpointer";
import { classifyQueryLayer, type RetrievalLayer } from "@/lib/rag/layers";
import { workbookToPreview } from "@/lib/knowledge/spreadsheet";
import path from "path";
import { readFile } from "fs/promises";

const AGENT_MAX_HISTORY_MESSAGES = Number(process.env.AGENT_MAX_HISTORY_MESSAGES || 8);

type ReservationState = "INIT" | "EXTRACTING_RESERVATION" | "READY_TO_SAVE";
type ReservationData = { date: string | null; time: string | null; people: string | null; name: string | null };
type SpreadsheetSourceLock = { sourceIds: string[]; fileUrls: string[] };

const AgentGraphState = Annotation.Root({
    ...MessagesAnnotation.spec,
    businessId: Annotation<string>(),
    businessName: Annotation<string>(),
    config: Annotation<any>(),
    customerPhone: Annotation<string | undefined>(),
    currentPlan: Annotation<string | undefined>({
        reducer: (_prev, next) => next,
        default: () => undefined,
    }),
    isTaskComplete: Annotation<boolean | undefined>({
        reducer: (_prev, next) => next,
        default: () => undefined,
    }),
    currentState: Annotation<ReservationState>({
        reducer: (_prev, next) => next,
        default: () => "INIT",
    }),
    reservationData: Annotation<ReservationData>({
        reducer: (prev, next) => ({
            date: next?.date ?? prev?.date ?? null,
            time: next?.time ?? prev?.time ?? null,
            people: next?.people ?? prev?.people ?? null,
            name: next?.name ?? prev?.name ?? null,
        }),
        default: () => ({ date: null, time: null, people: null, name: null }),
    }),
    availableFiles: Annotation<Array<{ fileName: string; sourceId: string; fileUrl: string }> | undefined>({
        reducer: (_prev, next) => next,
        default: () => undefined,
    }),
    retrievalLayer: Annotation<RetrievalLayer>({
        reducer: (_prev, next) => next,
        default: () => "general",
    }),
    activeLayer: Annotation<RetrievalLayer>({
        reducer: (_prev, next) => next,
        default: () => "general",
    }),
    spreadsheetSourceLock: Annotation<SpreadsheetSourceLock>({
        reducer: (_prev, next) => next,
        default: () => ({ sourceIds: [], fileUrls: [] }),
    }),
    repeatedPromptCount: Annotation<number>({
        reducer: (_prev, next) => next,
        default: () => 0,
    }),
    lastPromptFingerprint: Annotation<string>({
        reducer: (_prev, next) => next,
        default: () => "",
    }),
});

type AgentGraphStateType = typeof AgentGraphState.State;

function normalizeMessageContent(content: unknown): string {
    if (typeof content === "string") return content;
    if (!Array.isArray(content)) return "";
    return content
        .map((part: any) => {
            if (typeof part === "string") return part;
            if (part && typeof part === "object" && typeof part.text === "string") return part.text;
            return "";
        })
        .join(" ")
        .trim();
}

function getLastUserMessage(messages: BaseMessage[]) {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
        const msg: any = messages[i];
        if (msg?.getType?.() === "human") {
            return normalizeMessageContent(msg.content);
        }
    }
    return "";
}

function trimMessagesForModel(messages: BaseMessage[]) {
    const maxMessages = Math.max(4, Math.min(16, AGENT_MAX_HISTORY_MESSAGES));
    if (messages.length <= maxMessages) return messages;
    return messages.slice(-maxMessages);
}

function isReservationIntent(text: string) {
    return /(reserv|reserva|agendar|agenda|mesa\b|personas\b|cita|turno|horario|hora|\b\d{1,2}(:\d{2})?\s?(am|pm)?\b)/i.test(String(text || ""));
}

function isSpreadsheetEditIntent(text: string) {
    return /(excel|xlsx|xlsm|hoja|celda|fila|columna|actualiza|actualizar|modifica|modificar|agrega|agregar|append_row|update_cell)/i.test(String(text || ""));
}

function isAffirmativeReply(text: string) {
    return /^(si|sí|ok|dale|confirmo|confirmado|de acuerdo|listo|correcto|yes)\b/i.test(String(text || "").trim());
}

function isNegativeReply(text: string) {
    return /^(no|negativo|cancela|cancelar|mejor no)\b/i.test(String(text || "").trim());
}

function normalizeReservationData(base: ReservationData, partial: Partial<ReservationData>): ReservationData {
    return {
        date: partial.date || base.date || null,
        time: partial.time || base.time || null,
        people: partial.people || base.people || null,
        name: partial.name || base.name || null,
    };
}

function getFirstMissingReservationField(reservation: ReservationData): "time" | "people" | "name" | null {
    if (!reservation.time) return "time";
    if (!reservation.people) return "people";
    if (!reservation.name) return "name";
    return null;
}

function buildMissingFieldQuestion(field: "time" | "people" | "name") {
    if (field === "time") return "¿A qué hora deseas la reserva?";
    if (field === "people") return "¿Para cuántas personas?";
    return "¿A nombre de quién reservo?";
}

function pickReservationFileName(files: Array<{ fileName: string }>) {
    if (!files.length) return "reservas.xlsx";
    const preferred = files.find((f) => /(reserv|agenda|booking|cita)/i.test(f.fileName));
    return preferred?.fileName || files[0].fileName;
}

function tryParseExecutorRequest(raw: string): any | null {
    const text = String(raw || "").trim();
    if (!text.startsWith("{") || !text.endsWith("}")) return null;
    try {
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== "object") return null;
        if (typeof parsed.action !== "string") return null;
        return parsed;
    } catch {
        return null;
    }
}

function normalizeSpreadsheetFailureMessage(raw: string) {
    const value = String(raw || "").trim();
    if (!value) return "No pude procesar la hoja de cálculo por un problema técnico.";
    if (/Opciones disponibles|indiques cual editar|referencia .* ambigua|No se encontro archivo/i.test(value)) {
        return `Necesito que especifiques mejor el archivo a editar.\n${value}`;
    }
    if (/Falta '\w+'|Falta 'sheet'|Falta 'cell'|Falta 'rowValues'/i.test(value)) {
        return `Faltan datos para completar la acción.\n${value}`;
    }
    if (/Error al guardar|No se pudo|FAILED|problema tecnico/i.test(value)) {
        return `No pude completar la operación en la hoja de cálculo. ${value}`;
    }
    return value;
}

function isReservationAvailabilityQuery(text: string) {
    return /(reserva|reservar|disponible|disponibilidad|hora|horario|mesa|agenda|turno)/i.test(String(text || ""));
}

function isPrivacyProbeOnReservation(text: string) {
    return /(quien|quién|nombre|telefono|teléfono|a nombre de|persona|cliente|quien tiene|quién tiene|de quien|de quién)/i.test(String(text || ""));
}

function normalizeKey(value: string) {
    return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "")
        .trim();
}

function normalizeDateKey(value: string) {
    return normalizeKey(value);
}

function normalizeTimeKey(value: string) {
    const text = String(value || "").trim().toLowerCase();
    if (!text) return "";

    const match = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
    if (!match) return normalizeKey(text);

    let hour = Number(match[1]);
    const minute = Number(match[2] || "0");
    const meridiem = (match[3] || "").toLowerCase();

    if (meridiem === "pm" && hour < 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;

    const hh = String(Math.max(0, Math.min(23, hour))).padStart(2, "0");
    const mm = String(Math.max(0, Math.min(59, minute))).padStart(2, "0");
    return `${hh}:${mm}`;
}

function toCellAddress(colIndex: number, rowNumber: number) {
    let n = colIndex;
    let label = "";
    while (n >= 0) {
        label = String.fromCharCode((n % 26) + 65) + label;
        n = Math.floor(n / 26) - 1;
    }
    return `${label}${rowNumber}`;
}

function redactReservationSensitiveInfo(text: string) {
    let safe = String(text || "");
    safe = safe.replace(/a nombre de\s+([A-Za-zÁÉÍÓÚÑáéíóúñ\s]{2,60})/gi, "a nombre de [reservado]");
    safe = safe.replace(/(telefono|teléfono|celular|whatsapp)\s*[:\-]?\s*\+?\d[\d\s\-]{6,}/gi, "$1: [reservado]");
    safe = safe.replace(/\b\+?\d[\d\s\-]{8,}\b/g, "[reservado]");
    return safe;
}

function hasRecentReservationContext(messages: BaseMessage[]) {
    const recent = trimMessagesForModel(messages).slice(-6);
    return recent.some((msg: any) => {
        const content = normalizeMessageContent(msg?.content || "");
        return /(reserva|agendar|hora|personas|a nombre de|confirmame|confírmame)/i.test(content);
    });
}

function looksLikeReservationFollowUp(text: string) {
    return /(si|sí|ok|dale|confirmo|cambia|cambiar|mejor|para\s+las|a\s+las|somos|seremos|a nombre de|me llamo|soy\s+[A-Za-z])/i.test(String(text || "").toLowerCase());
}

function promptFingerprint(value: string) {
    return normalizeKey(value).slice(0, 240);
}

async function loadSpreadsheetBufferForGraph(fileUrl: string) {
    if (fileUrl.startsWith("/uploads/")) {
        const localPath = path.join(process.cwd(), "public", fileUrl.replace(/^\//, ""));
        const buffer = await readFile(localPath);
        return { buffer };
    }

    if (/^https?:\/\//i.test(fileUrl)) {
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`REMOTE_FILE_FETCH_FAILED:${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return { buffer: Buffer.from(arrayBuffer) };
    }

    throw new Error("UNSUPPORTED_FILE_URL");
}

async function inspectReservationSheet(params: {
    fileUrl: string;
    reservation: ReservationData;
    customerPhone?: string;
}) {
    const loaded = await loadSpreadsheetBufferForGraph(params.fileUrl);
    const sheets = workbookToPreview(loaded.buffer, { maxSheets: 6, maxRows: 600 });

    const requestedDate = normalizeDateKey(params.reservation.date || "");
    const requestedTime = normalizeTimeKey(params.reservation.time || "");
    const requestedName = normalizeKey(params.reservation.name || "");
    const requestedPhone = normalizeKey(params.customerPhone || "");

    let occupiedByOther: null | { sheet: string; rowNumber: number } = null;
    let sameCustomerRow: null | { sheet: string; rowNumber: number; idx: Record<string, number> } = null;

    for (const sheet of sheets) {
        const headerIdx = sheet.headers.map((h: string) => normalizeKey(h));
        const idx = {
            fecha: headerIdx.findIndex((h: string) => /fecha|dia/.test(h)),
            hora: headerIdx.findIndex((h: string) => /hora/.test(h)),
            nombre: headerIdx.findIndex((h: string) => /nombre|cliente/.test(h)),
            personas: headerIdx.findIndex((h: string) => /personas|cantidad|asistentes/.test(h)),
            telefono: headerIdx.findIndex((h: string) => /telefono|celular|whatsapp|contacto/.test(h)),
            estado: headerIdx.findIndex((h: string) => /estado|status/.test(h)),
        };

        if (idx.hora < 0) continue;

        for (let rowIndex = 0; rowIndex < sheet.rows.length; rowIndex++) {
            const row = sheet.rows[rowIndex] || [];
            const rowNumber = rowIndex + 2;
            const rowEstado = idx.estado >= 0 ? normalizeKey(String(row[idx.estado] || "")) : "";
            if (/cancelad|anulad|rechazad/.test(rowEstado)) continue;

            const rowDate = idx.fecha >= 0 ? normalizeDateKey(String(row[idx.fecha] || "")) : "";
            const rowTime = idx.hora >= 0 ? normalizeTimeKey(String(row[idx.hora] || "")) : "";
            const rowName = idx.nombre >= 0 ? normalizeKey(String(row[idx.nombre] || "")) : "";
            const rowPhone = idx.telefono >= 0 ? normalizeKey(String(row[idx.telefono] || "")) : "";

            const dateMatches = requestedDate ? (rowDate === requestedDate || rowDate.includes(requestedDate) || requestedDate.includes(rowDate)) : true;
            const timeMatches = requestedTime ? rowTime === requestedTime : false;
            const sameCustomer = Boolean(
                (requestedPhone && rowPhone && requestedPhone === rowPhone) ||
                (requestedName && rowName && requestedName === rowName)
            );

            if (dateMatches && sameCustomer && !sameCustomerRow) {
                sameCustomerRow = { sheet: sheet.name, rowNumber, idx };
            }

            if (dateMatches && timeMatches && !sameCustomer) {
                occupiedByOther = { sheet: sheet.name, rowNumber };
            }
        }
    }

    return { occupiedByOther, sameCustomerRow };
}

function sanitizeSpreadsheetResultForUser(params: {
    action: string;
    resultText: string;
    requestedMessage: string;
    fallback: string;
}) {
    const requested = String(params.requestedMessage || "");
    const value = redactReservationSensitiveInfo(String(params.resultText || "").trim());
    const safeFallback = redactReservationSensitiveInfo(String(params.fallback || ""));

    if (isReservationAvailabilityQuery(requested) && isPrivacyProbeOnReservation(requested)) {
        return "Por seguridad, no comparto datos personales de reservas. Solo puedo confirmar disponibilidad general de horarios.";
    }

    if (params.action === "READ_CELL" && isReservationAvailabilityQuery(requested)) {
        const valueMatch = value.match(/Valor:\s*(.*)$/im);
        const cellValue = (valueMatch?.[1] || "").trim();
        if (!cellValue || /^\(vacio\)$/i.test(cellValue)) {
            return "Ese horario aparece disponible.";
        }
        return "Ese horario ya aparece ocupado. Si deseas, te propongo otro horario disponible.";
    }

    if (params.action === "LIST" || params.action === "LIST_SHEETS") {
        return safeFallback || "Listo, encontré los archivos y hojas disponibles.";
    }

    if (isReservationAvailabilityQuery(requested) && /Fila agregada:/i.test(value)) {
        return "Listo, la reserva fue registrada correctamente.";
    }

    return safeFallback || value;
}

export const createAgentGraph = async (businessId: string, businessName: string, config: any, customerPhone?: string) => {
    const spreadsheetTool = createSpreadsheetUpdateTool(businessId);

    const ensureAvailableFiles = async (state: AgentGraphStateType) => {
        if (Array.isArray(state.availableFiles) && state.availableFiles.length > 0) {
            return state.availableFiles;
        }

        const files = await listSpreadsheetFilesForBusiness(businessId);
        return files.map((file) => ({
            fileName: file.fileName,
            sourceId: String(file.sourceId || ""),
            fileUrl: file.fileUrl,
        }));
    };

    const plannerNode = async (state: AgentGraphStateType) => {
        const lastUserMessage = getLastUserMessage(state.messages as BaseMessage[]);
        const retrievalLayer = classifyQueryLayer(lastUserMessage);

        if (state.currentState === "EXTRACTING_RESERVATION" || state.currentState === "READY_TO_SAVE") {
            return { currentPlan: "RESERVATION_FLOW", retrievalLayer, activeLayer: retrievalLayer };
        }

        if (hasRecentReservationContext(state.messages as BaseMessage[]) && looksLikeReservationFollowUp(lastUserMessage)) {
            return {
                currentPlan: "RESERVATION_FLOW",
                currentState: "EXTRACTING_RESERVATION" as ReservationState,
                retrievalLayer,
                activeLayer: retrievalLayer,
            };
        }

        if (isReservationIntent(lastUserMessage)) {
            return {
                currentPlan: "RESERVATION_FLOW",
                currentState: "EXTRACTING_RESERVATION" as ReservationState,
                retrievalLayer,
                activeLayer: retrievalLayer,
            };
        }

        if (isSpreadsheetEditIntent(lastUserMessage)) {
            return { currentPlan: "ACCION_EXCEL", retrievalLayer, activeLayer: retrievalLayer };
        }

        const reply = await brainModel.invoke([
            new SystemMessage("Clasifica la intención en exactamente una etiqueta: RESPONDER_DIRECTO o RESPONDER_CON_RAG."),
            ...trimMessagesForModel(state.messages as BaseMessage[]),
        ]);

        const plan = normalizeMessageContent((reply as any)?.content);
        return {
            currentPlan: /RESPONDER_DIRECTO/i.test(plan) ? "RESPONDER_DIRECTO" : "RESPONDER_CON_RAG",
            retrievalLayer,
            activeLayer: retrievalLayer,
        };
    };

    const reservationExtractorNode = async (state: AgentGraphStateType) => {
        const lastUserMessage = getLastUserMessage(state.messages as BaseMessage[]);
        const extracted = await reservationExtractorModel.invoke([
            new SystemMessage(
                `Extrae datos de reserva usando el contexto conversacional reciente y el estado actual.\n` +
                `Estado actual conocido: ${JSON.stringify(state.reservationData || {})}\n` +
                `Debes completar date/time/people/name e isAffirmative.\n` +
                `No borres datos previos si el ultimo mensaje solo corrige un campo.`
            ),
            ...trimMessagesForModel(state.messages as BaseMessage[]),
        ]);

        const mergedData = normalizeReservationData(state.reservationData, {
            date: extracted?.date || null,
            time: extracted?.time || null,
            people: extracted?.people || null,
            name: extracted?.name || null,
        });

        if (state.currentState === "READY_TO_SAVE") {
            if (isAffirmativeReply(lastUserMessage) || extracted?.isAffirmative) {
                return {
                    isTaskComplete: false,
                    currentPlan: "RESERVATION_SAVE",
                    reservationData: mergedData,
                };
            }

            if (isNegativeReply(lastUserMessage)) {
                return {
                    isTaskComplete: true,
                    currentState: "EXTRACTING_RESERVATION",
                    reservationData: mergedData,
                    messages: [new AIMessage("Perfecto, indícame qué dato deseas cambiar (hora, personas o nombre).")],
                };
            }
        }

        const missingField = getFirstMissingReservationField(mergedData);
        if (missingField) {
            const prompt = buildMissingFieldQuestion(missingField);
            const fingerprint = promptFingerprint(prompt);
            const repeated = state.lastPromptFingerprint === fingerprint ? (state.repeatedPromptCount || 0) + 1 : 1;

            if (repeated >= 3) {
                return {
                    isTaskComplete: true,
                    currentState: "EXTRACTING_RESERVATION",
                    reservationData: mergedData,
                    lastPromptFingerprint: fingerprint,
                    repeatedPromptCount: repeated,
                    messages: [new AIMessage("Para continuar sin errores, comparte todo junto en un solo mensaje: fecha, hora, cantidad de personas y nombre.")],
                };
            }

            return {
                isTaskComplete: true,
                currentState: "EXTRACTING_RESERVATION",
                reservationData: mergedData,
                lastPromptFingerprint: fingerprint,
                repeatedPromptCount: repeated,
                messages: [new AIMessage(prompt)],
            };
        }

        const summary = [
            `Hora: ${mergedData.time}`,
            `Personas: ${mergedData.people}`,
            `Nombre: ${mergedData.name}`,
            mergedData.date ? `Fecha: ${mergedData.date}` : "",
        ].filter(Boolean).join("\n");

        return {
            isTaskComplete: true,
            currentState: "READY_TO_SAVE",
            reservationData: mergedData,
            messages: [new AIMessage(`Confírmame por favor con 'sí' para guardar esta reserva:\n${summary}`)],
            repeatedPromptCount: 0,
            lastPromptFingerprint: "",
        };
    };

    const reservationSaveNode = async (state: AgentGraphStateType) => {
        const availableFiles = await ensureAvailableFiles(state);
        const lock = state.spreadsheetSourceLock || { sourceIds: [], fileUrls: [] };
        const lockedCandidate = availableFiles.find((f) =>
            lock.sourceIds.includes(String(f.sourceId || "")) || lock.fileUrls.includes(String(f.fileUrl || ""))
        );
        const targetFileName = lockedCandidate?.fileName || pickReservationFileName(availableFiles);
        const reservation = state.reservationData;

        try {
            if (!availableFiles.length) {
                await processExcelWorkOrder(businessId, {
                    actionType: "CREATE_FILE",
                    targetFileName,
                    extractedData: {
                        Fecha: "",
                        Hora: "",
                        Personas: "",
                        Nombre: "",
                        Canal: "",
                        Cliente: "",
                    },
                });
            }

            const targetFile = (await ensureAvailableFiles(state)).find((f) => f.fileName === targetFileName) || null;
            if (targetFile?.fileUrl) {
                const inspection = await inspectReservationSheet({
                    fileUrl: targetFile.fileUrl,
                    reservation,
                    customerPhone: state.customerPhone || customerPhone,
                }).catch(() => ({ occupiedByOther: null, sameCustomerRow: null }));

                if (inspection.occupiedByOther) {
                    return {
                        isTaskComplete: true,
                        currentState: "EXTRACTING_RESERVATION",
                        currentPlan: "RESERVATION_FLOW",
                        messages: [new AIMessage("Ese horario específico ya está ocupado. Si quieres, te ayudo a reservar una hora cercana disponible.")],
                    };
                }

                if (inspection.sameCustomerRow) {
                    const row = inspection.sameCustomerRow;
                    const updates: Array<{ sheet: string; cell: string; value: string }> = [];
                    if (row.idx.hora >= 0 && reservation.time) {
                        updates.push({ sheet: row.sheet, cell: toCellAddress(row.idx.hora, row.rowNumber), value: reservation.time });
                    }
                    if (row.idx.personas >= 0 && reservation.people) {
                        updates.push({ sheet: row.sheet, cell: toCellAddress(row.idx.personas, row.rowNumber), value: reservation.people });
                    }
                    if (row.idx.nombre >= 0 && reservation.name) {
                        updates.push({ sheet: row.sheet, cell: toCellAddress(row.idx.nombre, row.rowNumber), value: reservation.name });
                    }

                    for (const update of updates) {
                        await (spreadsheetTool as any).invoke({
                            action: "UPDATE_CELL",
                            targetFileName,
                            fileRef: targetFileName,
                            sheet: update.sheet,
                            cell: update.cell,
                            value: update.value,
                        });
                    }

                    return {
                        isTaskComplete: true,
                        currentState: "INIT",
                        currentPlan: undefined,
                        reservationData: { date: null, time: null, people: null, name: null },
                        messages: [new AIMessage(`Listo ${reservation.name || ""}, actualicé tu reserva.`)],
                    };
                }
            }

            await processExcelWorkOrder(businessId, {
                actionType: "APPEND_ROW",
                targetFileName,
                extractedData: {
                    Fecha: reservation.date || "",
                    Hora: reservation.time || "",
                    Personas: reservation.people || "",
                    Nombre: reservation.name || "",
                    Canal: "WHATSAPP",
                    Cliente: state.customerPhone || customerPhone || "",
                },
            });

            return {
                isTaskComplete: true,
                currentState: "INIT",
                currentPlan: undefined,
                reservationData: { date: null, time: null, people: null, name: null },
                repeatedPromptCount: 0,
                lastPromptFingerprint: "",
                messages: [new AIMessage(`Listo ${reservation.name || ""}, tu reserva quedo confirmada.`)],
            };
        } catch (error: any) {
            return {
                isTaskComplete: true,
                currentState: "READY_TO_SAVE",
                messages: [new AIMessage(`No pude guardar la reserva por un problema tecnico: ${error?.message || "error desconocido"}. Intenta nuevamente.`)],
            };
        }
    };

    const actionNode = async (state: AgentGraphStateType) => {
        const availableFiles = await ensureAvailableFiles(state);
        const lastUserMessage = getLastUserMessage(state.messages as BaseMessage[]);

        // Si otro agente ya envió JSON estructurado, se respeta y se ejecuta directo.
        const directRequest = tryParseExecutorRequest(lastUserMessage);
        const allowedSourceIds = state.spreadsheetSourceLock?.sourceIds || [];
        const allowedFileUrls = state.spreadsheetSourceLock?.fileUrls || [];

        const plan = directRequest || await spreadsheetExecutorRequestModel.invoke([
            new SystemMessage(
                `Convierte la petición a JSON para ejecutar spreadsheet. Responde SOLO JSON válido.\n` +
                `Acciones permitidas: LIST, LIST_SHEETS, READ_CELL, UPDATE_CELL, APPEND_ROW, CREATE_FILE, NONE.\n` +
                `Archivos disponibles: ${JSON.stringify(availableFiles)}\n` +
                `REGLAS CRITICAS: nunca expongas nombres o telefonos de terceros en responseToUser.\n` +
                `Para disponibilidad de reservas, valida el slot exacto solicitado (fecha + hora). Una reserva a las 5pm NO bloquea las 6pm.\n` +
                `Si no se puede ejecutar por datos faltantes o ambigüedad, usa action=NONE y explica en responseToUser.`
            ),
            ...trimMessagesForModel(state.messages as BaseMessage[]),
        ]);

        if (!plan || plan.action === "NONE") {
            return {
                isTaskComplete: true,
                messages: [new AIMessage(plan?.responseToUser || "Necesito más datos para buscar o editar la hoja de cálculo.")],
            };
        }

        try {
            const toolResult = await (spreadsheetTool as any).invoke({
                action: plan.action,
                targetFileName: plan.targetFileName || undefined,
                sourceId: plan.sourceId || undefined,
                fileRef: plan.fileRef || undefined,
                sheet: plan.sheet || undefined,
                cell: plan.cell || undefined,
                value: plan.value || undefined,
                rowValues: Array.isArray(plan.rowValues) ? plan.rowValues : undefined,
                data: plan.data || undefined,
                allowedSourceIds,
                allowedFileUrls,
            });

            const resultText = typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult);
            const failed = /Error al guardar|No se pudo|Falta '|ambigua|No se encontro archivo|necesito que indiques|problema tecnico/i.test(resultText);

            return {
                isTaskComplete: true,
                messages: [new AIMessage(
                    failed
                        ? normalizeSpreadsheetFailureMessage(resultText)
                        : sanitizeSpreadsheetResultForUser({
                            action: String(plan.action || ""),
                            resultText,
                            requestedMessage: lastUserMessage,
                            fallback: plan.responseToUser || "Listo, la acción en la hoja de cálculo se completó.",
                        })
                )],
            };
        } catch (error: any) {
            return {
                isTaskComplete: true,
                messages: [new AIMessage(`No pude ejecutar la petición en la hoja de cálculo: ${error?.message || "error desconocido"}.`)],
            };
        }
    };

    const ragResponseNode = async (state: AgentGraphStateType) => {
        const effectiveConfig = state.config || config || {};
        let ragContext = "";
        let nextSourceLock: SpreadsheetSourceLock = state.spreadsheetSourceLock || { sourceIds: [], fileUrls: [] };
        const lastUserMessage = getLastUserMessage(state.messages as BaseMessage[]);
        const retrievalLayer = state.activeLayer || state.retrievalLayer || classifyQueryLayer(lastUserMessage);

        try {
            const retrieval = await retrieveRagContext({
                businessId,
                query: lastUserMessage,
                retrievalLayer,
            });
            ragContext = retrieval.ragContext;

            const spreadsheetCandidates = (retrieval.selected || [])
                .filter((item) => {
                    const md = item.metadata || {};
                    const fileName = String((md as any).fileName || "").toLowerCase();
                    const fileType = String((md as any).fileType || "").toLowerCase();
                    return /\.xlsx|\.xlsm|\.xls/.test(fileName) || /spreadsheet|excel/.test(fileType);
                })
                .slice(0, 8);

            nextSourceLock = {
                sourceIds: Array.from(new Set(spreadsheetCandidates
                    .map((x) => String((x.metadata as any)?.sourceId || "").trim())
                    .filter(Boolean))),
                fileUrls: Array.from(new Set(spreadsheetCandidates
                    .map((x) => String((x.metadata as any)?.fileUrl || "").trim())
                    .filter(Boolean))),
            };
        } catch (error) {
            console.error("RAG retrieval error:", error);
        }

        const generationPrompt =
            `Responde con grounding estricto usando el contexto del negocio.\n` +
            `Contexto negocio: ${effectiveConfig?.businessDescription || ""}\n` +
            `Capa prioritaria de consulta: ${retrievalLayer}\n` +
            `RAG:\n${ragContext || "(sin contexto adicional)"}\n` +
            `REGLA DE PRIVACIDAD: nunca reveles nombres, telefonos u otros datos personales de reservas de terceros. ` +
            `Si preguntan quien tiene una hora, responde solo disponibilidad (ocupado/disponible) sin identidad.`;

        const reply = await brainModel.invoke([
            new SystemMessage(
                generationPrompt
            ),
            ...trimMessagesForModel(state.messages as BaseMessage[]),
        ]);

        let finalReply = normalizeMessageContent((reply as any)?.content);

        const audit = await brainModel.invoke([
            new SystemMessage(
                "Actua como auditor de grounding. Si la RESPUESTA incluye datos no presentes explicitamente en CONTEXTO, responde solo FAILED. " +
                "Si todo esta sustentado, responde solo PASSED."
            ),
            new AIMessage(`CONTEXTO:\n${ragContext || "(vacio)"}\n\nRESPUESTA:\n${finalReply}`),
        ]);

        const auditDecision = normalizeMessageContent((audit as any)?.content).toUpperCase();
        if (!/PASSED/.test(auditDecision)) {
            const retry = await brainModel.invoke([
                new SystemMessage(
                    generationPrompt +
                    "\nCORRECCION OBLIGATORIA: te inventaste datos. Cinetete solo al contexto textual. " +
                    "Si falta evidencia, responde: 'Lo siento, no tengo esa información específica en mis registros'."
                ),
                ...trimMessagesForModel(state.messages as BaseMessage[]),
            ]);
            finalReply = normalizeMessageContent((retry as any)?.content);
        }

        return {
            isTaskComplete: true,
            spreadsheetSourceLock: nextSourceLock,
            messages: [new AIMessage(finalReply)],
        };
    };

    const directResponseNode = async (state: AgentGraphStateType) => {
        const effectiveConfig = state.config || config || {};
        const reply = await brainModel.invoke([
            new SystemMessage(
                `Responde directo y breve. Contexto del negocio: ${effectiveConfig?.businessDescription || ""}. ` +
                `Nunca reveles datos personales (nombre, telefono, identificadores) de otros clientes.`
            ),
            ...trimMessagesForModel(state.messages as BaseMessage[]),
        ]);

        return {
            isTaskComplete: true,
            messages: [new AIMessage(normalizeMessageContent((reply as any)?.content))],
        };
    };

    const routeAfterPlanner = (state: AgentGraphStateType) => {
        if (state.currentPlan === "RESPONDER_DIRECTO") return "directResponse";
        if (state.currentPlan === "ACCION_EXCEL") return "actionNode";
        if (state.currentPlan === "RESERVATION_FLOW") return "reservationExtractorNode";
        return "ragResponseNode";
    };

    const routeAfterReservationExtractor = (state: AgentGraphStateType) => {
        if (state.currentPlan === "RESERVATION_SAVE" && state.isTaskComplete === false) return "reservationSaveNode";
        return END;
    };

    const workflow = new StateGraph(AgentGraphState)
        .addNode("plannerNode", plannerNode)
        .addNode("actionNode", actionNode)
        .addNode("reservationExtractorNode", reservationExtractorNode)
        .addNode("reservationSaveNode", reservationSaveNode)
        .addNode("ragResponseNode", ragResponseNode)
        .addNode("directResponse", directResponseNode)
        .addEdge(START, "plannerNode")
        .addConditionalEdges("plannerNode", routeAfterPlanner)
        .addConditionalEdges("reservationExtractorNode", routeAfterReservationExtractor)
        .addEdge("reservationSaveNode", END)
        .addEdge("actionNode", END)
        .addEdge("ragResponseNode", END)
        .addEdge("directResponse", END);

    const checkpointer = await getGraphCheckpointer();
    if (checkpointer) {
        return (workflow as any).compile({ checkpointer });
    }

    return workflow.compile();
};
