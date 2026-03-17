export type DashboardLocale = "es" | "en";

const dashboardCopyByLocale = {
  es: {
  confirmation: {
    cancel: "Cancelar",
    labels: {
      delete: "Confirmar eliminacion",
      bulkDelete: "Confirmar borrado masivo",
      cleanup: "Confirmar limpieza",
      disconnect: "Confirmar desconexion",
      deactivate: "Confirmar desactivacion",
    },
    irreversible: "Esta accion no se puede deshacer.",
  },
  shell: {
    clearNotifications: "Se eliminaran todas las notificaciones visibles del panel.",
    deleteAgent: (agentName: string) => `Vas a eliminar el agente ${agentName}.`,
    deleteAgentDetails: "Esta accion es irreversible.",
  },
  knowledge: {
    unsupportedFileType: (type: string) => `El tipo de archivo \"${type}\" no es soportado. Sube .txt, .md, .csv, .json o PDF.`,
    uploadQueued: "Documento en cola, iniciando procesamiento...",
    uploadSuccess: "Conocimiento cargado correctamente",
    uploadError: "No se pudo subir el archivo",
    deleteSuccess: "Fragmento eliminado",
    deleteError: "No se pudo eliminar el fragmento",
    deleteFragmentConfirm: "Seguro que quieres eliminar este fragmento de conocimiento?",
    deleteBulkConfirm: (count: number) => `Se eliminaran ${count} fragmento(s) de la base de conocimiento.`,
    bulkDeleteError: "No se pudo completar el borrado masivo",
    replayError: "No se pudo ejecutar replay",
    replaySuccess: (count: number) => `Se reencolaron ${count} job(s)`,
    cleanupError: "No se pudo ejecutar cleanup",
    cleanupSuccess: (count: number) => `Limpieza completada: ${count} job(s) eliminados`,
    cleanupConfirm: (days: number) => `Se eliminaran jobs COMPLETED/FAILED/DLQ mas antiguos que ${days} dia(s).`,
    cleanupDetails: "Esta accion ayuda a mantener la cola liviana y no afecta jobs activos.",
    websiteMissingUrl: "Ingresa una URL para sincronizar.",
    websiteInvalidUrl: "La URL no es valida.",
    websiteSyncError: "No se pudo sincronizar la URL.",
    websiteQueued: "URL en cola. Procesando contenido...",
    websiteSuccess: "Sitio sincronizado y agregado a la base de conocimiento.",
    healthReadError: "No se pudo leer health",
    healthFetchError: "No se pudo obtener el estado operativo",
    jobStatusReadError: "Error leyendo estado del job",
    jobStatusFetchError: "No se pudo consultar el estado del procesamiento",
    jobFailed: "El procesamiento fallo",
    jobTimeout: "Tiempo de espera agotado para el procesamiento del documento",
    processingFilePrefix: "Procesando:",
  },
  tools: {
    updateSuccess: "Herramientas actualizadas correctamente.",
    updateError: "No se pudo actualizar la herramienta. Intenta de nuevo.",
    openingConfig: (toolName: string) => `Abriendo configuracion de ${toolName}...`,
    deactivateConfirm: (toolName: string) => `Vas a desactivar ${toolName}.`,
    deactivateDetails: "El agente dejara de usar esta herramienta hasta que la conectes de nuevo.",
  },
  connections: {
    saveError: "Error al guardar. Intenta de nuevo.",
    disconnectError: "Error desconectando.",
    disconnectConfirm: (channelName: string) => `Vas a desconectar ${channelName}.`,
    disconnectDetails: "El agente dejara de recibir y responder mensajes en este canal hasta volver a conectarlo.",
  },
  },
  en: {
    confirmation: {
      cancel: "Cancel",
      labels: {
        delete: "Confirm deletion",
        bulkDelete: "Confirm bulk delete",
        cleanup: "Confirm cleanup",
        disconnect: "Confirm disconnect",
        deactivate: "Confirm deactivation",
      },
      irreversible: "This action cannot be undone.",
    },
    shell: {
      clearNotifications: "All visible dashboard notifications will be removed.",
      deleteAgent: (agentName: string) => `You are about to delete agent ${agentName}.`,
      deleteAgentDetails: "This action is irreversible.",
    },
    knowledge: {
      unsupportedFileType: (type: string) => `File type \"${type}\" is not supported. Upload .txt, .md, .csv, .json, or PDF.`,
      uploadQueued: "Document queued, starting processing...",
      uploadSuccess: "Knowledge uploaded successfully",
      uploadError: "Could not upload file",
      deleteSuccess: "Fragment deleted",
      deleteError: "Could not delete fragment",
      deleteFragmentConfirm: "Are you sure you want to delete this knowledge fragment?",
      deleteBulkConfirm: (count: number) => `${count} knowledge fragment(s) will be deleted.`,
      bulkDeleteError: "Bulk deletion could not be completed",
      replayError: "Replay could not be executed",
      replaySuccess: (count: number) => `${count} job(s) re-queued`,
      cleanupError: "Cleanup could not be executed",
      cleanupSuccess: (count: number) => `Cleanup completed: ${count} job(s) deleted`,
      cleanupConfirm: (days: number) => `COMPLETED/FAILED/DLQ jobs older than ${days} day(s) will be deleted.`,
      cleanupDetails: "This keeps the queue lightweight and does not affect active jobs.",
      websiteMissingUrl: "Enter a URL to sync.",
      websiteInvalidUrl: "URL is not valid.",
      websiteSyncError: "Could not sync URL.",
      websiteQueued: "URL queued. Processing content...",
      websiteSuccess: "Website synced and added to knowledge base.",
      healthReadError: "Could not read health",
      healthFetchError: "Could not fetch operational status",
      jobStatusReadError: "Error reading job status",
      jobStatusFetchError: "Could not fetch processing status",
      jobFailed: "Processing failed",
      jobTimeout: "Processing timeout reached",
      processingFilePrefix: "Processing:",
    },
    tools: {
      updateSuccess: "Tools updated successfully.",
      updateError: "Could not update tool. Please try again.",
      openingConfig: (toolName: string) => `Opening configuration for ${toolName}...`,
      deactivateConfirm: (toolName: string) => `You are about to deactivate ${toolName}.`,
      deactivateDetails: "The agent will stop using this tool until you connect it again.",
    },
    connections: {
      saveError: "Error while saving. Please try again.",
      disconnectError: "Error disconnecting.",
      disconnectConfirm: (channelName: string) => `You are about to disconnect ${channelName}.`,
      disconnectDetails: "The agent will stop receiving and replying on this channel until reconnected.",
    },
  },
} as const;

export const dashboardCopy = dashboardCopyByLocale.es;

export function getDashboardCopy(locale?: DashboardLocale | string) {
  if (locale === "en") return dashboardCopyByLocale.en;
  return dashboardCopyByLocale.es;
}

