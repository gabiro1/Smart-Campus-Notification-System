import { useEffect } from "react";

/**
 * SkipLink - Accessible skip to main content link
 * Renders an invisible link that becomes visible on keyboard focus.
 * Place at the very top of App.jsx, before all other content.
 */
export default function SkipLink() {
  const handleSkip = (e) => {
    e.preventDefault();
    const main = document.getElementById("main-content");
    if (main) {
      main.setAttribute("tabindex", "-1");
      main.focus();
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleSkip}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[9999] bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}
