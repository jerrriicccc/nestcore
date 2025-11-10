export const path = "/appointments";
export const defaultState = { data: [], meta: {} };
export const modelConfig = { read: "/index" };

export const listTable = {
  columns: [
    // { label: "APN Number", id: "apnnumber" },
    // { label: "Pet Name", id: "petName" },
    // { label: "Appointment Date", id: "appointmentdate" },
    // { label: "Time", id: "timeName" },
    // { label: "Service Type", id: "servicetype" },
    // { label: "Status", id: "status" },
    // { id: "id", hidden: true },
  ],
  buttons: [
    {
      name: "dropdown",
      type: "dropdownBtn",
      label: "Update",

      properties: {},
      items: [],
    },
  ],
};
