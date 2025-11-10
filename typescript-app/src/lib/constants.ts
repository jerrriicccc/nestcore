export const APIURL = "http://localhost:3000";

export const ACCESS_TOKEN = (() => {
  const token = sessionStorage.getItem("token");
  return token || "";
})();

export const RBAC_TREE: { [key: string]: string } = {
  // customers: "customers",
  // appointments: "appointments",
  // rolelines: "rolelines",
  // roles: "roles",
};
