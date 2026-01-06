export const APIURL = "http://localhost:3000";

// export const ACCESS_TOKEN = (() => {
//   const token = sessionStorage.getItem("token");
//   return token || "";
// })();

export const RBAC_TREE: { [key: string]: string } = {
  appointments: "appointments",
  appointmentsettings: "appointmentsettings",
  appointmentnumbers: "appointmentnumbers",
  appointmentworkflowsettings: "appointmentworkflowsettings",
  appointmentstatuses: "appointmentworkflowsettings",
  rolelines: "roles",
  roleaccessdetails: "roleaccessdetails",
  users: "users",
  accounts: "accounts",
};
