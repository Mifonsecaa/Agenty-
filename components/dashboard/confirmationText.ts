import { dashboardCopy } from "@/components/dashboard/dashboardCopy";

export const confirmationText = {
  cancel: dashboardCopy.confirmation.cancel,
  irreversible: dashboardCopy.confirmation.irreversible,
  labels: dashboardCopy.confirmation.labels,
  messages: {
    clearNotifications: dashboardCopy.shell.clearNotifications,
    disconnectChannel: dashboardCopy.connections.disconnectConfirm,
    deactivateTool: dashboardCopy.tools.deactivateConfirm,
    deleteAgent: dashboardCopy.shell.deleteAgent,
    deleteKnowledgeFragment: dashboardCopy.knowledge.deleteFragmentConfirm,
    deleteKnowledgeBulk: dashboardCopy.knowledge.deleteBulkConfirm,
    cleanupKnowledgeJobs: dashboardCopy.knowledge.cleanupConfirm,
  },
  details: {
    channelDisconnect: dashboardCopy.connections.disconnectDetails,
    toolDeactivate: dashboardCopy.tools.deactivateDetails,
    agentDelete: dashboardCopy.shell.deleteAgentDetails,
    cleanupKnowledgeJobs: dashboardCopy.knowledge.cleanupDetails,
  },
  knowledge: dashboardCopy.knowledge,
  tools: {
    updateSuccess: dashboardCopy.tools.updateSuccess,
    updateError: dashboardCopy.tools.updateError,
    openingConfig: dashboardCopy.tools.openingConfig,
  },
  connections: {
    saveError: dashboardCopy.connections.saveError,
    disconnectError: dashboardCopy.connections.disconnectError,
  },
} as const;

