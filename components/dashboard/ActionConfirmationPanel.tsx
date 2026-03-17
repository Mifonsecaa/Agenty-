import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useDashboardCopy } from "@/components/dashboard/useDashboardCopy";

type ActionConfirmationPanelProps = {
  message: ReactNode;
  details?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  disabled?: boolean;
};

export default function ActionConfirmationPanel({
  message,
  details,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isLoading = false,
  disabled = false,
}: ActionConfirmationPanelProps) {
  const { copy } = useDashboardCopy();
  const blocked = isLoading || disabled;

  return (
    <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs">
      <p className="text-red-100">{message}</p>
      {details ? <p className="text-red-200/80 mt-1">{details}</p> : null}

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={onCancel}
          disabled={blocked}
          className="rounded border border-white/15 px-3 py-1 text-[11px] text-white/80 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {cancelLabel || copy.confirmation.cancel}
        </button>
        <button
          onClick={onConfirm}
          disabled={blocked}
          className="inline-flex items-center gap-2 rounded border border-red-500/40 bg-red-500/20 px-3 py-1 text-[11px] text-red-100 hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

