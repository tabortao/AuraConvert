import { useToastStore } from "../stores/toastStore";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const colorMap = {
  success: "border-primary/50 bg-primary/10 text-primary",
  error: "border-destructive/50 bg-destructive/10 text-destructive",
  info: "border-blue-500/50 bg-blue-500/10 text-blue-500",
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="flex shrink-0 justify-end gap-2 px-4 py-2">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-2.5 rounded-lg border px-4 py-2.5 shadow-lg backdrop-blur-sm animate-in slide-in-from-right-full ${colorMap[toast.type]}`}
          >
            <Icon size={16} />
            <div className="flex flex-col">
              <span className="text-[13px] font-medium">{toast.message}</span>
              <span className="text-[11px] opacity-70">{toast.timestamp}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}