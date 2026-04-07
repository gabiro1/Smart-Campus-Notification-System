/**
 * @component LanguageToggle
 * @description Allows users to switch between English and Kinyarwanda for notification translations. Integrates with backend languagePreference field.
 */
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import authService from "../../services/authService";

const LANGUAGES = [
  { code: "en", label: "EN", full: "English" },
  { code: "rw", label: "KN", full: "Kinyarwanda" }
];

export default function LanguageToggle({ className = "", initialLanguage, onLanguageChange }) {
  const [currentLang, setCurrentLang] = useState(initialLanguage || "en");
  const [loading, setLoading] = useState(false);

  // Update internal state when prop changes (controlled component support)
  useEffect(() => {
    if (initialLanguage) {
      setCurrentLang(initialLanguage);
    }
  }, [initialLanguage]);

  const handleLanguageChange = async (langCode) => {
    if (langCode === currentLang || loading) return;

    const previousLang = currentLang;
    try {
      setLoading(true);
      // Optimistically update UI
      setCurrentLang(langCode);

      // Call backend to update languagePreference (handled via updateProfile)
      await authService.updateProfile({ languagePreference: langCode });

      // Notify parent if callback provided
      if (onLanguageChange) {
        onLanguageChange(langCode);
      }

      toast.success(`Language changed to ${LANGUAGES.find(l => l.code === langCode)?.full}`);
    } catch (error) {
      // Rollback on error
      setCurrentLang(previousLang);
      toast.error("Failed to change language");
      console.error("[LanguageToggle] Update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex bg-white/5 p-1 rounded-xl border border-white/10 ${className}`}>
      {LANGUAGES.map((lang) => {
        const isActive = currentLang === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            disabled={loading}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              isActive
                ? "bg-blue-600 border border-blue-500 text-white"
                : "text-neutral-500 hover:text-white hover:bg-white/10 border border-transparent"
            }`}
            aria-pressed={isActive}
            title={lang.full}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
