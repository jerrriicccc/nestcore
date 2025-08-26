import { useCallback, useReducer } from "react";
import { createData, readData, updateData, deleteData } from "./crud";

interface ModelConfig {
  read?: string;
  create?: string;
  update?: string;
  delete?: string;
  [key: string]: string | undefined;
}

interface RequestOptions {
  requestData?: Record<string, any>;
  [key: string]: any;
}

interface ActionOptions {
  action?: string;
  dispatchRequest?: boolean;
  dispatchResponse?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  [key: string]: any;
}

interface ErrorResponse {
  code: number;
  message: string;
  data: any | null;
}

type HttpFunction = (endpoint: string, options?: RequestOptions) => Promise<any>;

function useModelMethod(path: string, config: ModelConfig, method: string, dataDispatch: React.Dispatch<any>, statusDispatch: React.Dispatch<any>, httpFunction: HttpFunction) {
  // Clean the path and ensure it doesn't start or end with a slash
  const cleanPath = path ? path.replace(/^\/+|\/+$/g, "") : "";

  // Get the endpoint from config, defaulting to empty string if not found
  const endpoint = method in config ? config[method] || "" : "";

  // Combine path and endpoint, ensuring proper format
  const endPoint: string = `/${cleanPath}${endpoint}`;

  const fn = useCallback(
    async (requestOptions: RequestOptions = {}, options: ActionOptions = {}) => {
      const action = "action" in options ? options.action : method;
      statusDispatch({ status: "pending", action: action });

      try {
        // For GET requests with params, append them as query parameters
        let finalEndPoint = endPoint;
        if (method === "read" && requestOptions.requestData?.id) {
          const { id, ...restData } = requestOptions.requestData;
          requestOptions.requestData = restData;
          finalEndPoint = `${endPoint}?id=${id}`;
        }

        const responseData = await httpFunction(finalEndPoint, requestOptions);
        // Pass both request and response data to the reducer
        dataDispatch({
          type: action,
          request: requestOptions.requestData,
          response: responseData,
        });

        const body = prepareDispatchBody(options, requestOptions, responseData);
        statusDispatch({ status: "success", action: action, body: body });

        // Call onSuccess callback if provided
        if (options.onSuccess) {
          options.onSuccess();
        }
      } catch (error: any) {
        console.error(`[useModelMethod] Error in ${method} request:`, error);
        const errorData: ErrorResponse = {
          code: error.code || 500,
          message: error.message || "An unknown error occurred",
          data: error.data || null,
        };

        const body = prepareDispatchBody({ ...options, dispatchResponse: true }, requestOptions, errorData);
        statusDispatch({ status: "error", action: action, body: body });

        // Call onError callback if provided
        if (options.onError) {
          options.onError(error);
        }
      }
    },
    [endPoint, config, method, dataDispatch, statusDispatch, httpFunction]
  );

  return fn;
}

export const useHttpRequest = (path: string, endPoint: any, dataDispatch: any, statusDispatch: any, httpFunction: any) => {
  const url = path + endPoint;

  const fn = useCallback(
    async (requestOptions = {}, options = {}) => {
      const action = "action" in options ? options.action : endPoint;
      statusDispatch({ status: "pending", action: action });

      try {
        const responseData = await httpFunction(url, requestOptions);
        dataDispatch({ type: action, response: responseData });

        const body = prepareDispatchBody(options, requestOptions, responseData);
        statusDispatch({ status: "success", action: action, body: body });
      } catch (error: any) {
        // Error is already in our format, no need to parse
        const errorData = {
          code: error.code || 500,
          message: error.message || "An unknown error occurred",
          data: error.data || null,
        };

        const body = prepareDispatchBody(options, requestOptions, errorData);
        statusDispatch({ status: "error", action: action, body: body });
      }
    },
    [url, dataDispatch, statusDispatch, httpFunction]
  );

  return fn;
};

function prepareDispatchBody(options: any, request: any, response: any) {
  const { dispatchRequest = false, dispatchResponse = false } = options;
  let body = {};

  body = dispatchRequest === true ? { request } : {};
  body = dispatchResponse === true ? { ...body, response } : body;
  return body;
}

function dataStatusReducer(state: any, action: any) {
  let newState = { ...state, status: action.status, action: action.action };

  if (action.status === "error" || action.status === "success") {
    newState = { ...newState, body: action.body };
  }

  return newState;
}

const useModel = (path: string, state: any, config: ModelConfig, dataReducer: any) => {
  const [dataState, dataDispatch] = useReducer(dataReducer, state);
  const [dataStatus, statusDispatch] = useReducer(dataStatusReducer, { status: "", action: "", body: {} });

  const create = useModelMethod(path, config, "create", dataDispatch, statusDispatch, createData as HttpFunction);
  const read = useModelMethod(path, config, "read", dataDispatch, statusDispatch, readData as HttpFunction);
  const update = useModelMethod(path, config, "update", dataDispatch, statusDispatch, updateData as HttpFunction);
  const del = useModelMethod(path, config, "delete", dataDispatch, statusDispatch, deleteData as HttpFunction);

  const setData = useCallback(
    (data: any, action: string) => {
      dataDispatch({ type: action, response: data });
      statusDispatch({ status: "success", action: action, body: { request: data, response: data } });
    },
    [dataDispatch, statusDispatch]
  );

  const setStatus = useCallback(
    (data: any, status: string, action: string) => {
      statusDispatch({ status: status, action: action, body: { request: data } });
    },
    [statusDispatch]
  );

  return [dataState, { post: create, get: read, put: update, delete: del, setData, setStatus, dataDispatch, statusDispatch }, dataStatus];
};

export const useSelectOption = (path: string, state: any, endPoint: any, dataReducer: any) => {
  const config = { read: endPoint };
  const [dataState, model, dataStatus] = useModel(path, state, config, dataReducer);

  return [dataState, model.get, dataStatus];
};

export default useModel;
