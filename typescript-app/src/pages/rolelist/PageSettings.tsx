export const navButton: any[] = [
  {
    name: "btnAccessDet",
    label: "Access Details",
    type: "link" as "link",
    url: "/roleaccesslist",
  },
  {
    name: "btnCreate",
    label: "Create",
    type: "link" as "link",
    url: "/role/create",
  },
];

export const path = "/roles";
export const defaultState = { data: [], meta: {} };
export const modelConfig = {
  read: "/index",
  delete: "/deletecard",
};

export const listTable = {
  columns: [
    { label: "Name", id: "name" },
    { id: "id", hidden: true },
  ],
  buttons: [
    {
      name: "update",
      type: "link" as "link",
      label: "Update",
      url: { path: "/role/update", ref: "id" },
    },
    {
      name: "delete",
      type: "button" as "button",
      label: "Delete",
      variant: "danger",
    },
  ],
};
