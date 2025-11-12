import { useEffect } from "react";
import { useValidation } from "./use-validation";
import { redirect, useSearchParams, useNavigate } from "react-router-dom";

interface UseUpdateFieldProps {
  callbackFunction: (data: any, action: string) => void;
}

export const useUpdateField = ({ callbackFunction }: UseUpdateFieldProps) => {
  const fc = (object: any) => {
    callbackFunction({ ...object }, "updateField");
  };
  return fc;
};

interface UseDataStatusListenerProps {
  statusState: any;
  action: string;
  status: string;
  callbackFunction: any;
}

export const useDataStatusListener = ({ statusState, action, status, callbackFunction }: UseDataStatusListenerProps) => {
  useEffect(() => {
    if (statusState.status === status && statusState.action === action) {
      callbackFunction(statusState.body);
    }
  }, [statusState]);
};

interface UseRedirectOnErrorStatusProps {
  statusState: any;
  action: string;
  path: string;
  errorCode: number;
}

interface UseRedirectOnErrorStatusOptions extends UseRedirectOnErrorStatusProps {
  // If provided, this callback will be invoked with the response body when an access-denied (errorCode) occurs.
  // If the callback is provided, the hook will NOT navigate; it will call this callback instead.
  onAccessDenied?: (responseBody: any) => void;
}

export const useRedirectOnErrorStatus = ({ path, statusState, action, errorCode, onAccessDenied }: UseRedirectOnErrorStatusOptions) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (statusState.action === action && statusState.status === "error") {
      const resp = statusState.body?.response || statusState.body;
      const statusCode = resp?.status || resp?.code || null;

      if (statusCode === errorCode) {
        if (typeof onAccessDenied === "function") {
          try {
            onAccessDenied(resp);
          } catch (err) {
            console.error("onAccessDenied callback threw an error:", err);
            // Fallback to navigate if callback fails
            navigate(path);
          }
        } else {
          navigate(path);
        }
      }
    }
  }, [statusState]);
};

interface UseDataBySearchParamsProps {
  callbackFunction: (dataParam: any, actionParam: any) => void;
  searchParam: any;
}
export const useDataBySearchParams = ({ callbackFunction, searchParam }: UseDataBySearchParamsProps) => {
  const [searchParams] = useSearchParams();

  // Extract the search criteria
  const rawSearch = searchParams.get(searchParam);
  let searchCond = rawSearch || "";

  const page = Number(searchParams.get("page") || 0);

  // Build query object
  const queryString: Record<string, any> = {};
  if (searchCond) {
    queryString[searchParam] = searchCond;
  }
  if (page > 0) {
    queryString.page = page;
  }

  // Wrap callback with criteria if conditions exist
  const fnByCriteria = useDataByCriteria({
    callbackFunction,
    criteria: queryString,
  });

  const fn = Object.keys(queryString).length === 0 ? () => callbackFunction(undefined, undefined) : fnByCriteria;

  return [fn, searchCond];
};

interface UseDataByCriteriaData {
  callbackFunction: (dataParam: any, actionParam: any) => void;
  criteria: any;
  options?: any;
}
export const useDataByCriteria = ({ callbackFunction, criteria, options = {} }: UseDataByCriteriaData) => {
  const action = "action" in options ? options.action : "read";

  const fn = () => {
    callbackFunction({ requestData: criteria }, { action });
  };
  return fn;
};

interface UseInitializeDataProps {
  functionName: (param?: any) => void;
  args?: any;
  id?: any;
  deps?: any[];
}

export const useInitializeData = ({ functionName, args = {}, id, deps = [] }: UseInitializeDataProps) => {
  useEffect(() => {
    if (typeof functionName !== "function") return;

    if (id) {
      functionName(id);
    } else if (args !== undefined) {
      functionName(args);
    }
  }, deps);
};

export default useInitializeData;

interface UseDataByIdProps {
  callbackFunction: any;
  id: any;
  options?: any;
}

export const useDataById = ({ callbackFunction, id, options }: UseDataByIdProps) => {
  const preventZeroValue = "preventZeroValue" in options ? options.preventZeroValue : true;
  const action = "action" in options ? options.action : "read";

  if (preventZeroValue && (id === 0 || id === null)) {
    return () => {};
  }

  const fn = () => {
    callbackFunction({ requestData: { id } }, { action });
  };
  return fn;
};

interface UseSimpleConfirmDeleteProps<T extends { id: number | string }> {
  delFn: (params: { requestData: any }, options: { dispatchRequest: boolean }) => void;
  refField?: keyof T;
  confirmMessage?: string;
  onSuccess?: () => void;
}

interface DeleteData<T extends { id: number | string }> {
  event?: (arg: any[]) => void;
  row?: T;
  index?: number;
}

export const useSimpleConfirmDelete = <T extends { id: number | string }>({ delFn, refField = "id" as keyof T, onSuccess }: UseSimpleConfirmDeleteProps<T>) => {
  const deleteData = async ({ event, row, index }: DeleteData<T>) => {
    if (!row) return;

    try {
      await delFn(
        {
          requestData: { id: row[refField] },
        },
        {
          dispatchRequest: true,
        }
      );
      onSuccess?.();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return deleteData;
};

interface UseCardFormSubmitHandlerProps {
  validateFn: (data: any) => any;
  data?: any;
  model: any;
  mode: "create" | "update";
  options?: Record<string, any>;
}

export const useCardFormSubmitHandler = ({ validateFn, data, model, mode, options = {} }: UseCardFormSubmitHandlerProps) => {
  const validate = useValidation({ validateFn, setStatus: model.setStatus });
  const { contentType = "", onSuccess, onError } = options;

  const fn = async () => {
    if (!data) return;
    const validationResult = validate({ data });

    if (!validationResult.ok) {
      console.warn("Validation failed:", validationResult.errors);
      alert(Object.values(validationResult.errors).join("\n"));
      return;
    }

    try {
      if (mode === "create") {
        await model.post({ requestData: data, contentType }, { dispatchRequest: true, ...options });
        onSuccess?.();
      } else if (mode === "update") {
        const updateData = {
          ...data,
          id: data.id,
        };
        await model.put({ requestData: updateData, contentType }, { dispatchRequest: true, ...options });
        onSuccess?.();
      }
    } catch (error) {
      console.error("Request failed:", error);
      onError?.(error as Error);
      throw error;
    }
  };
  return fn;
};
