import React from "react";

/**
 * FormLabel - Accessible label for form fields
 *
 * @param {Object} props
 * @param {string} props.children - Label text
 * @param {string} props.htmlFor - ID of the input element
 * @param {boolean} props.required - Show required asterisk (default: false)
 * @param {string} props.className - Additional classes
 */
export default function FormLabel({
  children,
  htmlFor,
  required = false,
  className = "",
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wide ${className}`}
    >
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
}
