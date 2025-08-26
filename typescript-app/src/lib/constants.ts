// API URL for WEB
export const APIURL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export const ACCESS_TOKEN = (() => {
  const token = sessionStorage.getItem("auth_token");
  return token || "";
})();

export const RBAC_TREE: { [key: string]: string } = {
  // customers: "customers",
  // users: "users",
};
