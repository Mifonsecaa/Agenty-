let cachedCheckpointerPromise: Promise<any | null> | null = null;

function envEnabled() {
    return (process.env.LANGGRAPH_CHECKPOINTER_ENABLED || "true").toLowerCase() !== "false";
}

export async function getGraphCheckpointer() {
    if (!envEnabled()) return null;
    if (cachedCheckpointerPromise) return cachedCheckpointerPromise;

    cachedCheckpointerPromise = (async () => {
        const connectionString = process.env.LANGGRAPH_CHECKPOINTER_URL || process.env.DATABASE_URL;
        if (!connectionString) {
            console.warn("[GraphCheckpointer] Missing LANGGRAPH_CHECKPOINTER_URL/DATABASE_URL. Using in-memory graph state.");
            return null;
        }

        try {
            // Lazy import para no romper entornos sin dependencia instalada.
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const checkpointPkg = require("@langchain/langgraph-checkpoint-postgres");
            const PostgresSaver = checkpointPkg?.PostgresSaver;
            if (!PostgresSaver) {
                console.warn("[GraphCheckpointer] PostgresSaver not available. Using in-memory graph state.");
                return null;
            }

            const saver = await PostgresSaver.fromConnString(connectionString);
            if (typeof saver?.setup === "function") {
                await saver.setup();
            }
            console.log("[GraphCheckpointer] PostgreSQL checkpointer ready.");
            return saver;
        } catch (error) {
            console.error("[GraphCheckpointer] Failed to initialize postgres checkpointer:", error);
            return null;
        }
    })();

    return cachedCheckpointerPromise;
}

