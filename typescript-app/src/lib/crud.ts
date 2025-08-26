import { APIURL, RBAC_TREE } from "./constants";
import { getToken } from "./token-service";

export interface RequestOptions {
  requestData?: any;
  params?: any;
  token?: string;
  contentType?: "application/json" | "form-data";
  queryParams?: Record<string, any>;
  endpoint?: string;
}

const getLocalStore = (key: string) => {
  return localStorage.getItem(key) === null ? "" : localStorage.getItem(key);
};

export const getLocalToken = () => {
  return getLocalStore("token");
};

export function getDefaultHeaders(requestOptions: RequestOptions = {}) {
  const token = getToken();
  const contentType = requestOptions.contentType || "application/json";

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": contentType,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    // If your backend expects X-Rbac-Token, you can add it here as well:
    // headers["X-Rbac-Token"] = token;
  }

  // let module = "customers";
  // if (requestOptions.endpoint) {
  //   const pathSegments = requestOptions.endpoint.split("/");
  //   module = pathSegments[0] || "customers";
  // }
  // let rbacToken = localStorage.getItem(`RBAC-${module}`) || token || "";
  // headers["X-Rbac-Token"] = `${module} ${rbacToken}`;
  // // --- End x-rbac-token logic ---

  if (contentType === "form-data") {
    delete headers["Content-Type"];
  }

  return headers;
}

function getRBACModuleFromTree(endPoint: string) {
  return endPoint in RBAC_TREE ? RBAC_TREE[endPoint] : endPoint;
}

export function getRBACHeader(header: Headers, path: string) {
  const pathSegments = path.split("/");

  const module = pathSegments.length > 1 ? getRBACModuleFromTree(pathSegments[1]) : "";
  header.append("X-RBAC-Token", module + " " + getLocalStore(`RBAC-${module}`));
  return header;
}

function getRequestBodyByRaw(requestData: any) {
  return requestData;
}

function getRequestBodyByFormData(requestData: any) {
  const formData = new FormData();
  for (const key in requestData) {
    if (Object.prototype.hasOwnProperty.call(requestData, key)) {
      formData.append(key, requestData[key]);
    }
  }
  return formData;
}

function getRequestBody(requestOptions: RequestOptions, requestData: any) {
  const contentType = requestOptions.contentType || "application/json";
  return contentType === "form-data" ? getRequestBodyByFormData(requestData) : getRequestBodyByRaw(requestData);
}

async function sendHttpRequest(endPoint: string, method: string, headers: any, body?: any) {
  const options: RequestInit = {
    method,
    headers,
  };

  if (method !== "GET") {
    options.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${APIURL}${endPoint}`, options);
  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(json.message || "API Error");
  }

  return json;
}

export async function readData(endPoint: string, requestOptions: RequestOptions = {}) {
  let headers = new Headers(getDefaultHeaders(requestOptions));
  headers = getRBACHeader(headers, endPoint);

  // Handle query parameters
  let finalEndPoint = endPoint;
  if (requestOptions.requestData) {
    const queryParams = new URLSearchParams();
    Object.entries(requestOptions.requestData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Special handling for searchcond parameter
        if (key === "searchcond") {
          // If it's already a string, use it directly
          if (typeof value === "string") {
            queryParams.append(key, value);
          } else {
            // If it's an object, stringify it
            queryParams.append(key, JSON.stringify(value));
          }
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      finalEndPoint = `${endPoint}${endPoint.includes("?") ? "&" : "?"}${queryString}`;
    }
  }

  return await sendHttpRequest(finalEndPoint, "GET", headers);
}

// export async function readData(endPoint: string, requestOptions: RequestOptions = {}) {
//   const headers = getDefaultHeaders(requestOptions);

//   // Handle query parameters
//   let finalEndPoint = endPoint;
//   if (requestOptions.requestData) {
//     const queryParams = new URLSearchParams();
//     Object.entries(requestOptions.requestData).forEach(([key, value]) => {
//       if (value !== undefined && value !== null) {
//         // Special handling for searchcond parameter
//         if (key === "searchcond") {
//           // If it's already a string, use it directly
//           if (typeof value === "string") {
//             queryParams.append(key, value);
//           } else {
//             // If it's an object, stringify it
//             queryParams.append(key, JSON.stringify(value));
//           }
//         } else {
//           queryParams.append(key, String(value));
//         }
//       }
//     });
//     const queryString = queryParams.toString();
//     if (queryString) {
//       finalEndPoint = `${endPoint}${endPoint.includes("?") ? "&" : "?"}${queryString}`;
//     }
//   }

//   return await sendHttpRequest(finalEndPoint, "GET", headers);
// }

export async function createData(endPoint: string, requestOptions: RequestOptions = {}) {
  const headers = getDefaultHeaders(requestOptions);
  const body = getRequestBody(requestOptions, requestOptions.requestData);
  return await sendHttpRequest(endPoint, "POST", headers, body);
}

export async function updateData(endPoint: string, requestOptions: RequestOptions = {}) {
  const headers = getDefaultHeaders(requestOptions);
  const body = getRequestBody(requestOptions, requestOptions.requestData);
  return await sendHttpRequest(endPoint, "PUT", headers, body);
}

export async function deleteData(endPoint: string, requestOptions: RequestOptions = {}) {
  const headers = getDefaultHeaders(requestOptions);
  const body = getRequestBody(requestOptions, requestOptions.requestData);
  return await sendHttpRequest(endPoint, "DELETE", headers, body);
}
