interface useValidateByType {
  data: Record<string, any>;
  fields: Array<{ name: string; required?: boolean }>;
  type: string;
}

export const useValidateByType = ({ data, fields, type }: useValidateByType) => {
  const result: Record<string, any> = {};
  let hasError = false;

  fields.forEach((field) => {
    if (type === "empty") {
      if (field.required && (!data[field.name] || data[field.name].trim() === "")) {
        result[field.name] = `${field} is required`;
        hasError = true;
      }
    }
  });

  return {
    ok: !hasError,
    errors: result,
  };
};

interface UseValidationProps {
  validateFn: (data: any) => any;
  setStatus: (status: any) => void;
}

export const useValidation = ({ validateFn, setStatus }: UseValidationProps) => {
  return (data: any) => {
    const result = validateFn(data);
    setStatus(result);
    return result;
  };
};
