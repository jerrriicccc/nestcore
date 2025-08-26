export const navButton: any[] = [
  {
    name: "btnCreate",
    label: "Book Appointment",
    type: "link" as "link",
    url: "/appointment/create",
  },
];

export const path = "/appointments";
export const defaultState = { data: [], meta: {} };
export const modelConfig = {
  read: "/getloggedbyemail",
  delete: "/deletecard",
};

export const listTable = {
  columns: [
    { label: "APN Number", id: "apnnumber" },
    { label: "Pet Name", id: "petName" },
    { label: "Qauntity", id: "quantity" },
    { label: "Createdby", id: "createdby" },
    { label: "Appointment Date", id: "appointmentdate" },
    // { label: "Date Created", id: "datecreated" },
    { label: "Time", id: "timeid" },
    { label: "Service Type", id: "servicetype" },
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
