export const navButton: any[] = [
  {
    name: "Users List",
    label: "Create",
    type: "link" as "link",
    url: "/user/create",
  },
  {
    name: "Users List",
    label: "Sample",
    type: "link" as "link",
    url: "/user/create",
  },
];

export const listTable = {
  columns: [
    { label: "Email", id: "email" },
    { label: "Phone Number", id: "phonenumber" },
    { label: "Birth Date", id: "birthdateText" },
    { label: "Status", id: "status" },

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
