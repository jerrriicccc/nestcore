import { request } from "express";
// import { APIURL, RBAC_TREE } from "./constants";

// interface RequestOptions {
//   responseConversion?: "JSON" | "BLOB";
// }

// interface ApiResponse {
//   message?: string;
//   [key: string]: any;
// }

// export async function sendHttpRequest(endPoint: string, method: string, headers: Headers, body?: any, reqOptions: RequestOptions = {}) {
//   const { responseConversion = "JSON" } = reqOptions;
//   let options: RequestInit = { method, headers };
//   if (method !== "GET") options = { body: JSON.stringify(body), ...options };

//   console.log("FETCH HEADERS:", headers instanceof Headers ? Array.from(headers.entries()) : headers);
//   const response = await fetch(`${APIURL}${endPoint}`, options);
//   let data: ApiResponse = {};

//   if (responseConversion === "JSON") {
//     data = await response.json();
//   } else if (responseConversion === "BLOB") {
//     data = await response.blob();
//   }

//   if (!response.ok) {
//     const sjson = JSON.stringify({ code: response.status, message: data.message || "Error" });
//     throw new Error(sjson);
//   }

//   return { response, data };
// }

// const getLocalStorageToken = () => {
//   return localStorage.getItem("token");
// };

// export function getDefaultHeaders(requestOptions: RequestOptions = {}) {
//   const header = new Headers();

//   header.append("Authorization", "bearer " + getLocalStorageToken());
//   if (!("contentType" in requestOptions) || requestOptions.contentType === "application/json") {
//     header.append("Content-Type", "application/json");
//   }

//   return header;
// }

// function getRBACModuleFromTree(endPoint: string) {
//   return RBAC_MODULES.includes(endPoint) ? endPoint : "";
// }

// function getLocalStore(key: string) {
//   return localStorage.getItem(key);
// }

// function setLocalStore(key: string, value: string) {
//   localStorage.setItem(key, value);
// }

// export function getRBACHeader(headerInit: HeadersInit, endPoint: string): Headers {
//   const headers = new Headers(headerInit);

//   // Use the first segment of the endpoint as the module name
//   const pathSegments = endPoint.split("/");
//   const module = pathSegments[0] || "global";
//   let rbacToken = getLocalStore(`RBAC-${module}`);
//   if (!rbacToken) {
//     rbacToken = getLocalStorageToken();
//     if (rbacToken && module) {
//       setLocalStore(`RBAC-${module}`, rbacToken); // save it for future
//     }
//   }
//   // Always set the header, even if rbacToken is empty
//   const rbacHeaderValue = module + " " + (rbacToken || "");
//   headers.set("x-rbac-token", rbacHeaderValue); // <-- all lowercase

//   console.log("RBAC HEADER:", { module, rbacToken, endPoint, rbacHeaderValue });

//   return headers;
// }

// export const readData = <T>(endPoint: string, requestOptions: RequestOptions = {}) => {
//   // let headerdata = getDefaultHeaders(requestOptions);
//   // headerdata = getRBACHeader(headerdata, endPoint);

//   const baseHeaders = getDefaultHeaders(requestOptions); // returns a Headers object
//   const finalHeaders = getRBACHeader(baseHeaders, endPoint); // sets x-rbac-token on a Headers object

//   return sendHttpRequest(endPoint, "GET", finalHeaders).then(({ data }) => data as T);
// };

// export const createData = <T>(endPoint: string, data: Record<string, any>, requestOptions: RequestOptions = {}) => {
//   let headerdata = getDefaultHeaders(requestOptions);
//   headerdata = getRBACHeader(headerdata, endPoint);

//   return sendHttpRequest(endPoint, "POST", headerdata, data).then(({ data: responseData }) => responseData as T);
// };

// export const updateData = <T>(endPoint: string, id: number, data: Record<string, any>, requestOptions: RequestOptions = {}) => {
//   let headerdata = getDefaultHeaders(requestOptions);
//   headerdata = getRBACHeader(headerdata, endPoint);

//   const updatedData = { id, ...data };
//   return sendHttpRequest(endPoint, "PUT", headerdata, updatedData).then(({ data: responseData }) => responseData as T);
// };

// export const deleteData = <T>(endPoint: string, id: number, requestOptions: RequestOptions = {}) => {
//   let headerdata = getDefaultHeaders(requestOptions);
//   headerdata = getRBACHeader(headerdata, endPoint);

//   return sendHttpRequest(endPoint, "DELETE", headerdata, { id }).then(({ data: responseData }) => responseData as T);
// };
