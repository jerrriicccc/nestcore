import React, { Fragment } from "react";
import Dashboard from "./Dashboard";
// interface TableActions {
//   dropdownBtn: (id: number) => void;
// }

const Controlller = () => {
  // const [appointments, appointmentModel] = useModel(path, defaultState, modelConfig, listDataReducer);
  // useInitializeData({ functionName: appointmentModel.get });

  // const tableActions: TableActions = {
  //   dropdownBtn: (id: number) => {},
  // };

  return (
    <Fragment>
      <Dashboard />
      {/* <div className="px-4"><DashboardTable data={appointments.data} actions={tableActions} /></div> */}
    </Fragment>
  );
};

export default Controlller;
