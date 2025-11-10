export const navButton: any[] = [
  {
    name: "btnCreate",
    label: "Create",
    type: "link" as "link",
    url: "/appointment/create",
  },
];

export const path = "/appointments";
export const defaultState = { data: [], meta: {} };
export const modelConfig = {
  read: "/index",
  delete: "/deletecard",
};

export const listTable = {
  columns: [
    { label: "Last Name", id: "lastname" },
    { label: "First Name", id: "firstname" },
    { id: "id", hidden: true },
  ],
  buttons: [
    {
      name: "update",
      type: "link" as "link",
      label: "Update",
      url: { path: "/appointment/update", ref: "id" },
    },
    {
      name: "delete",
      type: "button" as "button",
      label: "Delete",
      variant: "danger",
    },
  ],
};
