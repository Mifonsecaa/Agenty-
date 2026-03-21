const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

function ensureEvolutionConfig() {
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
        throw new Error("EVOLUTION_CONFIG_MISSING: Configura EVOLUTION_API_URL y EVOLUTION_API_KEY");
    }
}

function normalizeBaseUrl(baseUrl: string) {
    const trimmed = String(baseUrl || "").trim().replace(/\/+$/, "");
    if (/\/manager$/i.test(trimmed)) {
        return trimmed.replace(/\/manager$/i, "");
    }
    return trimmed;
}

function getEvolutionBaseCandidates() {
    ensureEvolutionConfig();
    const primary = normalizeBaseUrl(EVOLUTION_API_URL!);
    const candidates = new Set<string>([primary]);

    if (!/\/api$/i.test(primary)) {
        candidates.add(`${primary}/api`);
    }
    if (!/\/v2$/i.test(primary)) {
        candidates.add(`${primary}/v2`);
    }

    return Array.from(candidates);
}

async function parseApiResponse(response: Response) {
    const text = await response.text();
    try {
        return text ? JSON.parse(text) : {};
    } catch {
        return { raw: text };
    }
}

async function evolutionRequest(path: string, init: RequestInit = {}) {
    const headers = {
        apikey: EVOLUTION_API_KEY!,
        ...(init.headers || {}),
    };

    const bases = getEvolutionBaseCandidates();
    const attempted: Array<{ base: string; status: number; data: unknown }> = [];

    for (const base of bases) {
        const url = `${base}${path}`;
        const response = await fetch(url, { ...init, headers });
        const data = await parseApiResponse(response);

        if (response.ok) {
            return data;
        }

        attempted.push({ base, status: response.status, data });

        // Si el endpoint no existe en esta base, intentamos la siguiente.
        if (response.status === 404) {
            continue;
        }

        throw new Error(`EVOLUTION_HTTP_${response.status}@${base}: ${JSON.stringify(data)}`);
    }

    throw new Error(
        `EVOLUTION_HTTP_404: ${JSON.stringify({
            path,
            attempted,
            hint: "Revisa EVOLUTION_API_URL. Si usas Render, evita /manager y valida base /, /api o /v2.",
        })}`
    );
}

function parseEvolutionHttpError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const match = message.match(/^EVOLUTION_HTTP_(\d+)(?:@[^:]+)?:\s*(.*)$/);
    if (!match) return null;

    const status = Number(match[1]);
    let payload: any = null;
    try {
        payload = match[2] ? JSON.parse(match[2]) : null;
    } catch {
        payload = { raw: match[2] };
    }

    return { status, payload, message };
}


export const evolutionService = {
    async createInstance(instanceName: string) {
        try {
            console.log(`[EvolutionService] Creating instance at: ${EVOLUTION_API_URL}/instance/create`);
            const data = await evolutionRequest(`/instance/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    instanceName,
                    token: instanceName,
                    integration: 'WHATSAPP-BAILEYS',
                    qrcode: true
                })
            });
            console.log("[EvolutionService] Create Instance full response:", JSON.stringify(data, null, 2));
            return data;
        } catch (error) {
            console.error("[EvolutionService] Error creating instance:", error);
            throw error;
        }
    },

    async getQR(instanceName: string) {
        try {
            console.log(`[EvolutionService] Getting QR at: ${EVOLUTION_API_URL}/instance/connect/${instanceName}`);
            const data = await evolutionRequest(`/instance/connect/${instanceName}`, {
                method: 'GET',
            });
            console.log("[EvolutionService] Get QR response:", data);
            return data;
        } catch (error) {
            console.error("[EvolutionService] Error getting QR:", error);
            throw error;
        }
    },

    async getInstanceStatus(instanceName: string) {
        try {
            console.log(`[EvolutionService] Getting status at: ${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`);
            const data = await evolutionRequest(`/instance/connectionState/${instanceName}`, {
                method: 'GET',
            });
            console.log("[EvolutionService] Get Status response:", data);
            return data;
        } catch (error) {
            const upstream = parseEvolutionHttpError(error);
            if (upstream?.status === 404) {
                // La instancia aun no existe.
                return { status: 404, error: "Not Found", instance: null };
            }

            console.error("[EvolutionService] Error getting status:", error);
            throw error;
        }
    },

    async deleteInstance(instanceName: string) {
        try {
            console.log(`[EvolutionService] Deleting instance at: ${EVOLUTION_API_URL}/instance/delete/${instanceName}`);
            await evolutionRequest(`/instance/delete/${instanceName}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error("[EvolutionService] Error deleting instance:", error);
        }
    },

    async sendMessage(instanceName: string, number: string, text: string) {
        try {
            console.log(`[EvolutionService] Sending message to ${number} via ${instanceName}`);
            const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': EVOLUTION_API_KEY!
                },
                body: JSON.stringify({
                    number,
                    text: text,
                    linkPreview: false
                })
            });
            return await response.json();
        } catch (error) {
            console.error("[EvolutionService] Error sending message:", error);
            throw error;
        }
    },

    async fetchContact(instanceName: string, jid: string) {
        try {
            console.log(`[EvolutionService] Fetching contact ${jid} via ${instanceName}`);
            const response = await fetch(`${EVOLUTION_API_URL}/contact/fetchContact/${instanceName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': EVOLUTION_API_KEY!
                },
                body: JSON.stringify({
                    where: { jid }
                })
            });
            return await response.json();
        } catch (error) {
            console.error("[EvolutionService] Error fetching contact:", error);
            return null;
        }
    },

    async setWebhook(instanceName: string, url: string) {
        try {
            console.log(`[EvolutionService] Setting webhook for ${instanceName} to ${url}`);
            const data = await evolutionRequest(`/webhook/set/${instanceName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    webhook: {
                        enabled: true,
                        url: url,
                        webhookByEvents: false,
                        events: [
                            "MESSAGES_UPSERT",
                            "MESSAGES_UPDATE",
                            "MESSAGES_DELETE",
                            "SEND_MESSAGE"
                        ]
                    }
                })
            });
            console.log("[EvolutionService] Set Webhook response:", JSON.stringify(data, null, 2));
            return data;
        } catch (error) {
            console.error("[EvolutionService] Error setting webhook:", error);
            throw error;
        }
    },

    async sendMedia(instanceName: string, number: string, mediaUrl: string, mediaType: "image" | "video" | "document" = "image", caption: string = "") {
        try {
            console.log(`[EvolutionService] Sending media to ${number} via ${instanceName}`);
            
            // Determinar mimetype y tipo basado en extensión si es posible
            let mimetype = "image/jpeg";
            if (mediaUrl.endsWith(".pdf")) {
                mimetype = "application/pdf";
                mediaType = "document";
            } else if (mediaUrl.endsWith(".png")) {
                mimetype = "image/png";
            }

            const response = await fetch(`${EVOLUTION_API_URL}/message/sendMedia/${instanceName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': EVOLUTION_API_KEY!
                },
                body: JSON.stringify({
                    number,
                    mediatype: mediaType,
                    mimetype: mimetype,
                    media: mediaUrl,
                    fileName: mediaUrl.split("/").pop() || "archivo",
                    caption: caption
                })
            });

            const data = await response.json().catch(() => ({}));
            const ok = response.ok && !data?.error;
            if (!ok) {
                console.error("[EvolutionService] Send Media failed:", {
                    status: response.status,
                    statusText: response.statusText,
                    data,
                });
            } else {
                console.log("[EvolutionService] Send Media response:", data);
            }

            return {
                ok,
                data,
                error: ok ? undefined : (data?.message || data?.error || `${response.status} ${response.statusText}`),
            };
        } catch (error) {
            console.error("[EvolutionService] Error sending media:", error);
            throw error;
        }
    },

    async fetchMediaBase64(instanceName: string, messageObject: any) {
        try {
            console.log(`[EvolutionService] Fetching media base64 for message in ${instanceName}`);
            // Evolution API endpoint typical structure
            const response = await fetch(`${EVOLUTION_API_URL}/chat/getBase64FromMediaMessage/${instanceName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': EVOLUTION_API_KEY!
                },
                body: JSON.stringify({
                    message: messageObject,
                    convertToMp4: false
                })
            });

            const data = await response.json();
            // Expected response: { base64: "..." }
            if (data && data.base64) {
                 return data.base64;
            }
            console.warn("[EvolutionService] No base64 found in response:", data);
            return null;
        } catch (error) {
            console.error("[EvolutionService] Error fetching media base64:", error);
            return null;
        }
    },
};
