import { useState } from 'react';

export function useForm(initialValues = {}, validationSchema = null) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!validationSchema) return true;

    try {
      validationSchema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error.errors) {
        const fieldErrors = {};
        error.errors.forEach(err => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleChange = (field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (touched[field] && errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (onSubmit) => {
    setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit(values);
      setValues(initialValues);
      setErrors({});
      setTouched({});
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    submitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
  };
}