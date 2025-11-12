import { APIURL, RBAC_TREE } from "./constants";
import { getToken, getRBACToken } from "./token-service";

export interface RequestOptions {
  requestData?: any;
  params?: any;
  token?: string;
  contentType?: "application/json" | "form-data";
  queryParams?: Record<string, any>;
  endpoint?: string;
}

const getLocalStore = (key: string) => {
  return sessionStorage.getItem(key) === null ? "" : sessionStorage.getItem(key);
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
  } else {
    console.warn("No token found in sessionStorage. User may need to log in again.");
  }

  if (contentType === "form-data") {
    delete headers["Content-Type"];
  }

  return headers;
}

function getRBACModuleFromTree(endPoint: string) {
  // If endpoint is a key in RBAC_TREE, return the mapped value
  if (endPoint in RBAC_TREE) {
    return RBAC_TREE[endPoint];
  }
  // Otherwise, return the endpoint as-is (for direct module names)
  return endPoint;
}

export function getRBACHeader(header: Headers, path: string) {
  const pathSegments = path.split("/").filter((segment) => segment.length > 0);

  // Extract module from path (first segment after leading slash)
  // e.g., "/appointments/newcard" -> "appointments"
  const moduleName = pathSegments.length > 0 ? pathSegments[0] : "";

  if (!moduleName) {
    console.warn(`Could not extract module name from path: ${path}`);
    return header;
  }

  // Get the RBAC module name (may be mapped via RBAC_TREE)
  const module = getRBACModuleFromTree(moduleName);

  // Get the RBAC token for the specific module
  const rbacToken = getRBACToken(module);

  if (!rbacToken) {
    console.warn(`No RBAC token found for module: ${module} (extracted from path: ${path})`);
    console.warn(
      `Available sessionStorage keys:`,
      Object.keys(sessionStorage).filter((k) => k.startsWith("RBAC-"))
    );
    return header;
  }

  // Format the header as: "module rbacToken"
  const rbacHeaderValue = `${module} ${rbacToken}`;
  header.append("x-rbac-token", rbacHeaderValue);
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
    // Log detailed error information for debugging
    const headerObj: Record<string, string> = {};
    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        // Mask sensitive headers in logs
        if (key.toLowerCase() === "authorization") {
          headerObj[key] = value.substring(0, 20) + "...";
        } else {
          headerObj[key] = value;
        }
      });
    } else {
      Object.assign(headerObj, headers);
    }

    // Create error with more details
    const error = new Error(json.message || json.error || "API Error");
    (error as any).status = response.status;
    (error as any).code = json.code;
    (error as any).data = json;
    throw error;
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

export async function createData(endPoint: string, requestOptions: RequestOptions = {}) {
  let headers = new Headers(getDefaultHeaders(requestOptions));
  headers = getRBACHeader(headers, endPoint);
  const body = getRequestBody(requestOptions, requestOptions.requestData);
  return await sendHttpRequest(endPoint, "POST", headers, body);
}

export async function updateData(endPoint: string, requestOptions: RequestOptions = {}) {
  let headers = new Headers(getDefaultHeaders(requestOptions));
  headers = getRBACHeader(headers, endPoint);
  const body = getRequestBody(requestOptions, requestOptions.requestData);
  return await sendHttpRequest(endPoint, "PUT", headers, body);
}

export async function deleteData(endPoint: string, requestOptions: RequestOptions = {}) {
  let headers = new Headers(getDefaultHeaders(requestOptions));
  headers = getRBACHeader(headers, endPoint);
  const body = getRequestBody(requestOptions, requestOptions.requestData);
  return await sendHttpRequest(endPoint, "DELETE", headers, body);
}
