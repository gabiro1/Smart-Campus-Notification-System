import React from "react";
import FormLabel from "./FormLabel";
import FormError from "./FormError";
import FormHelperText from "./FormHelperText";

/**
 * FormField - Wrapper for form inputs with label, error, helper text
 *
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {string} props.htmlFor - Input ID
 * @param {boolean} props.required - Required indicator
 * @param {React.ReactNode} props.children - Input element
 * @param {string} props.error - Error message (if any)
 * @param {string} props.helper - Helper text (optional)
 * @param {string} props.className - Additional classes for container
 */
export default function FormField({
  label,
  htmlFor,
  required = false,
  children,
  error,
  helper,
  className = "",
}) {
  return (
    <div className={className}>
      {label && (
        <FormLabel htmlFor={htmlFor} required={required}>
          {label}
        </FormLabel>
      )}
      {children}
      {error && <FormError message={error} />}
      {helper && !error && <FormHelperText>{helper}</FormHelperText>}
    </div>
  );
}
