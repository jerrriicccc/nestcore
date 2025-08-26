export const navButton: any[] = [];

export const path = "/users";
export const defaultState = { data: [], meta: {} };
export const modelConfig = {
  read: "/index",
  delete: "/deletecard",
};

export const listTable = {
  columns: [
    { label: "Email", id: "email" },
    { label: "Role", id: "roleName" },
    { label: "Default Role", id: "defaultrolename" },
    { label: "Status", id: "statusname" },

    { id: "id", hidden: true },
  ],
  buttons: [
    {
      name: "update",
      type: "link" as "link",
      label: "Update",
      url: { path: "/user/update", ref: "id" },
    },
    {
      name: "delete",
      type: "button" as "button",
      label: "Delete",
      variant: "danger",
    },
  ],
};
