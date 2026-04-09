import { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom"; // <-- Import createPortal
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    console.error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const { isDarkMode } = useTheme();

  const showToast = useCallback((message, type = "success") => {
    console.log(`[Toast Triggered]: ${message} (${type})`); // Debug log to ensure function runs

    setToast({ visible: true, message, type });

    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  // The actual UI of the toast
  const toastContent = (
    <div
      className={`fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 transform ${
        toast.visible
          ? "translate-y-0 opacity-100"
          : "translate-y-10 opacity-0 pointer-events-none"
      } ${
        toast.type === "success"
          ? isDarkMode 
            ? "bg-card border-green-500/30 text-green-400" 
            : "bg-card border-green-600/30 text-green-600"
          : isDarkMode
            ? "bg-card border-red-500/30 text-red-400"
            : "bg-card border-red-600/30 text-red-600"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle2 size={20} className={isDarkMode ? "text-green-500" : "text-green-600"} />
      ) : (
        <AlertCircle size={20} className={isDarkMode ? "text-red-500" : "text-red-600"} />
      )}
      <p className="text-sm font-medium text-foreground">{toast.message}</p>
      <button
        onClick={() => setToast({ ...toast, visible: false })}
        className="ml-2 hover:text-foreground/70 transition-colors text-muted-foreground"
      >
        <X size={16} />
      </button>
    </div>
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* createPortal forces the Toast to render directly inside the <body> tag */}
      {typeof document !== "undefined" &&
        createPortal(toastContent, document.body)}
    </ToastContext.Provider>
  );
};
