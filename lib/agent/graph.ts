import { Annotation, END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { AIMessage, BaseMessage, SystemMessage } from "@langchain/core/messages";
import { retrieveRagContext } from "@/lib/rag/retriever";
import { brainModel, reservationExtractorModel, spreadsheetExecutorRequestModel } from "@/lib/ai";
import { processExcelWorkOrder } from "../tools/excel-handler";
import { createSpreadsheetUpdateTool, listSpreadsheetFilesForBusiness } from "../tools/knowledge-tool";
import { getGraphCheckpointer } from "./checkpointer";

const AGENT_MAX_HISTORY_MESSAGES = Number(process.env.AGENT_MAX_HISTORY_MESSAGES || 8);

type ReservationState = "INIT" | "EXTRACTING_RESERVATION" | "READY_TO_SAVE";
type ReservationData = { date: string | null; time: string | null; people: string | null; name: string | null };

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
    return /(reserv|reserva|agendar|agenda|mesa\b|personas\b|cita|turno)/i.test(String(text || ""));
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
    return /(quien|quién|nombre|telefono|teléfono|a nombre de|persona)/i.test(String(text || ""));
}

function sanitizeSpreadsheetResultForUser(params: {
    action: string;
    resultText: string;
    requestedMessage: string;
    fallback: string;
}) {
    const requested = String(params.requestedMessage || "");
    const value = String(params.resultText || "").trim();

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
        return params.fallback || "Listo, encontré los archivos y hojas disponibles.";
    }

    if (isReservationAvailabilityQuery(requested) && /Fila agregada:/i.test(value)) {
        return "Listo, la reserva fue registrada correctamente.";
    }

    return params.fallback || value;
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

        if (state.currentState === "EXTRACTING_RESERVATION" || state.currentState === "READY_TO_SAVE") {
            return { currentPlan: "RESERVATION_FLOW" };
        }

        if (isReservationIntent(lastUserMessage)) {
            return { currentPlan: "RESERVATION_FLOW", currentState: "EXTRACTING_RESERVATION" as ReservationState };
        }

        if (isSpreadsheetEditIntent(lastUserMessage)) {
            return { currentPlan: "ACCION_EXCEL" };
        }

        const reply = await brainModel.invoke([
            new SystemMessage("Clasifica la intención en exactamente una etiqueta: RESPONDER_DIRECTO o RESPONDER_CON_RAG."),
            ...trimMessagesForModel(state.messages as BaseMessage[]),
        ]);

        const plan = normalizeMessageContent((reply as any)?.content);
        return {
            currentPlan: /RESPONDER_DIRECTO/i.test(plan) ? "RESPONDER_DIRECTO" : "RESPONDER_CON_RAG",
        };
    };

    const reservationExtractorNode = async (state: AgentGraphStateType) => {
        const lastUserMessage = getLastUserMessage(state.messages as BaseMessage[]);
        const extracted = await reservationExtractorModel.invoke([
            new SystemMessage("Extrae SOLO del ultimo mensaje del usuario los campos date/time/people/name y si es afirmacion corta. Si no aparece, devuelve null."),
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
            return {
                isTaskComplete: true,
                currentState: "EXTRACTING_RESERVATION",
                reservationData: mergedData,
                messages: [new AIMessage(buildMissingFieldQuestion(missingField))],
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
        };
    };

    const reservationSaveNode = async (state: AgentGraphStateType) => {
        const availableFiles = await ensureAvailableFiles(state);
        const targetFileName = pickReservationFileName(availableFiles);
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

        const plan = directRequest || await spreadsheetExecutorRequestModel.invoke([
            new SystemMessage(
                `Convierte la petición a JSON para ejecutar spreadsheet. Responde SOLO JSON válido.\n` +
                `Acciones permitidas: LIST, LIST_SHEETS, READ_CELL, UPDATE_CELL, APPEND_ROW, CREATE_FILE, NONE.\n` +
                `Archivos disponibles: ${JSON.stringify(availableFiles)}\n` +
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

        try {
            const retrieval = await retrieveRagContext({ businessId, query: getLastUserMessage(state.messages as BaseMessage[]) });
            ragContext = retrieval.ragContext;
        } catch (error) {
            console.error("RAG retrieval error:", error);
        }

        const reply = await brainModel.invoke([
            new SystemMessage(
                `Responde con grounding estricto usando el contexto del negocio.\n` +
                `Contexto negocio: ${effectiveConfig?.businessDescription || ""}\n` +
                `RAG:\n${ragContext || "(sin contexto adicional)"}\n` +
                `REGLA DE PRIVACIDAD: nunca reveles nombres, telefonos u otros datos personales de reservas de terceros. ` +
                `Si preguntan quien tiene una hora, responde solo disponibilidad (ocupado/disponible) sin identidad.`
            ),
            ...trimMessagesForModel(state.messages as BaseMessage[]),
        ]);

        return {
            isTaskComplete: true,
            messages: [new AIMessage(normalizeMessageContent((reply as any)?.content))],
        };
    };

    const directResponseNode = async (state: AgentGraphStateType) => {
        const effectiveConfig = state.config || config || {};
        const reply = await brainModel.invoke([
            new SystemMessage(`Responde directo y breve. Contexto del negocio: ${effectiveConfig?.businessDescription || ""}`),
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
