import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorState({ message = "Failed to load data", onRetry }) {
  return (
    <div className="p-6 flex items-center justify-center min-h-[40vh]">
      <div className="text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <p className="text-sm text-muted-foreground">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1 mx-auto transition-colors"
          >
            <RefreshCw size={14} /> Retry
          </button>
        )}
      </div>
    </div>
  );
}
