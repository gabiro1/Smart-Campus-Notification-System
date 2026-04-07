import { useState } from "react";

/**
 * Simple form validation hook
 * @param {Object} initialValues - Initial form values
 * @param {Object} validators - Field validators: { field: (value) => errorMessage | null }
 */
export default function useFormValidation(initialValues, validators = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Validate on change if field has been touched
    if (touched[field]) {
      const error = validators[field]?.(value) || null;
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validators[field]?.(values[field]) || null;
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(validators).forEach((field) => {
      const error = validators[field](values[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    setTouched(
      Object.keys(validators).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setValues,
  };
}
