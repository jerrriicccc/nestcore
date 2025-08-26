export const navButton: any[] = [
  {
    name: "btnCreate",
    label: "Create",
    type: "link" as "link",
    url: "/customer/create",
  },
];

export const path = "/customers";
export const defaultState = { data: [], meta: {} };
export const modelConfig = {
  read: "/index",
  delete: "/deletecard",
};

export const listTable = {
  columns: [
    { label: "First Name", id: "firstname" },
    { label: "Last Name", id: "lastname" },
    { label: "Status", id: "statusname" },
    { id: "id", hidden: true },
  ],
  buttons: [
    {
      name: "update",
      type: "link" as "link",
      label: "Update",
      url: { path: "/customer/update", ref: "id" },
    },
    {
      name: "delete",
      type: "button" as "button",
      label: "Delete",
      variant: "danger",
    },
  ],
};
