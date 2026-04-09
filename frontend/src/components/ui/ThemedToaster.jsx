import { Toaster } from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";

export default function ThemedToaster({ position = "top-right" }) {
  const { isDarkMode } = useTheme();
  
  return (
    <Toaster 
      theme={isDarkMode ? "dark" : "light"} 
      position={position}
      toastOptions={{
        style: {
          borderRadius: '12px',
          padding: '12px 16px',
        },
        success: {
          iconTheme: {
            primary: isDarkMode ? '#10b981' : '#059669',
            secondary: isDarkMode ? '#000' : '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: isDarkMode ? '#ef4444' : '#dc2626',
            secondary: isDarkMode ? '#000' : '#fff',
          },
        },
      }}
    />
  );
}