import { useReducer, useCallback } from "react";

function httpReducer(state: any, action: any) {
  if (action.type === "SEND") {
    return {
      status: "pending",
      data: state.data,
      error: null,
    };
  }
  if (action.type === "SUCCESS") {
    return {
      status: "completed",
      data: action.data,
      error: null,
    };
  }
  if (action.type === "ERROR") {
    return {
      status: "completed",
      data: state.data,
      error: action.errorMessage,
    };
  }
  return state;
}

const useHttpCallback = (requestFunction: any, callbackFunction: any) => {
  const [httpstate, dispatch] = useReducer(httpReducer, {
    status: null,
    data: null,
    error: null,
  });

  const sendRequest = useCallback(
    async (endpoint: string, requestOptions: any, callbackTag: any) => {
      dispatch({ type: "SEND" });
      try {
        const responseData = await requestFunction(endpoint, requestOptions);
        dispatch({ type: "SUCCESS", data: responseData });
        callbackFunction({ type: "SUCCESS", data: responseData }, callbackTag);
      } catch (error: any) {
        dispatch({ type: "ERROR", errorMessage: error.message || "Something went wrong!" });
        callbackFunction({ type: "ERROR", errorMessage: error.message || "Something went wrong!" }, callbackTag);
      }
    },
    [requestFunction, callbackFunction]
  );

  return {
    sendRequest,
    ...httpstate,
  };
};

export default useHttpCallback;
