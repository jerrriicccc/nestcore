import { readData, createData, updateData, deleteData } from "./crud";
import { useReducer } from "react";

const parseErrorBody = (error: any) => {
  if (error?.response?.data) return error.response.data;
  try {
    return JSON.parse(error.message);
  } catch {
    return { message: error?.message || "Request failed" };
  }
};

function useModelMethod(path: string, config: Record<string, any>, method: string, dataDispatch: any, statusDispatch: any, httpFunction: any) {
  const endPoint = method in config ? path + config[method] : "";
  const fn = async function (requestOptions = {}, options = {}) {
    const action = "action" in options ? options.action : method;
    statusDispatch({ status: "pending", action });
    try {
      const responseData = await httpFunction(endPoint, requestOptions);
      dataDispatch({ type: action, response: responseData });

      const body = prepareDispatchBody(options, requestOptions, responseData);
      statusDispatch({ status: "success", action, body });
    } catch (error) {
      const response = parseErrorBody(error);
      const body = prepareDispatchBody({ dispatchResponse: true, ...options }, requestOptions, response);
      statusDispatch({ status: "error", action, body });
    }
  };

  return fn;
}

export const useHttpRequest = (path: string, endPoint: string, dataDispatch: any, statusDispatch: any, httpFunction: any) => {
  const url = path + endPoint;
  const fn = async function (requestOptions = {}, options = {}) {
    const action = "action" in options ? options.action : endPoint;
    statusDispatch({ status: "pending", action });
    try {
      const responseData = await httpFunction(url, requestOptions);
      dataDispatch({ type: action, response: responseData });

      const body = prepareDispatchBody(options, requestOptions, responseData);
      statusDispatch({ status: "success", action, body });
    } catch (error) {
      const response = parseErrorBody(error);
      const body = prepareDispatchBody(options, requestOptions, response);
      statusDispatch({ status: "error", action, body });
    }
  };

  return fn;
};

function prepareDispatchBody(options: { dispatchRequest?: boolean; dispatchResponse?: boolean } = {}, request: any, response: any) {
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
  return { ...newState };
}

const useCRUD = (path: string, state: any, config: Record<string, any>, dataReducer: any) => {
  const [dataState, dataDispatch] = useReducer(dataReducer, state);
  const [dataStatus, statusDispatch] = useReducer(dataStatusReducer, { status: "", action: "", body: {} });

  const create = useModelMethod(path, config, "create", dataDispatch, statusDispatch, createData);
  const read = useModelMethod(path, config, "read", dataDispatch, statusDispatch, readData);
  const update = useModelMethod(path, config, "update", dataDispatch, statusDispatch, updateData);
  const del = useModelMethod(path, config, "delete", dataDispatch, statusDispatch, deleteData);
  const setData = (data: any, action: string = "") => {
    dataDispatch({ type: action, response: data });
    statusDispatch({ status: "success", action, body: { request: data } });
  };
  const setStatus = (data: any, status: string, action: string) => {
    statusDispatch({ status: status, action, body: { request: data } });
  };

  return [dataState, { post: create, get: read, put: update, delete: del, setData, setStatus, dataDispatch, statusDispatch }, dataStatus];
};

export const useGet = (path: string, state: any, config: Record<string, any>, dataReducer: any) => {
  const [dataState, dataDispatch] = useReducer(dataReducer, state);
  const [dataStatus, statusDispatch] = useReducer(dataStatusReducer, { status: "", action: "", body: {} });

  const read = useModelMethod(path, config, "read", dataDispatch, statusDispatch, readData);

  return [dataState, read, dataStatus];
};

export default useCRUD;
