export const navButton: any[] = [
  {
    name: "btnCreate",
    label: "Create",
    type: "link" as "link",
    url: "/roleaccessdetails/create",
  },
];

export const path = "/roleaccessdetails";
export const defaultState = { data: [], meta: {} };
export const modelConfig = {
  read: "/index",
  delete: "/deletecard",
};

export const listTable = {
  columns: [
    { label: "Type", id: "typeName" },
    { label: "Name", id: "name" },
    // { label: "Access", id: "accessName" },
    { id: "id", hidden: true },
  ],
  buttons: [
    {
      name: "update",
      type: "link" as "link",
      label: "Update",
      url: { path: "/roleaccessdetails/update", ref: "id" },
    },
    {
      name: "delete",
      type: "button" as "button",
      label: "Delete",
      variant: "danger",
    },
  ],
};
