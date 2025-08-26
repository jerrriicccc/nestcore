import React, { Fragment } from "react";
import Dashboard from "./Dashboard";
import useModel from "../../lib/use-model";
import { listDataReducer } from "../../lib/functions";
import { path, defaultState, modelConfig } from "./PageSettings";
import useInitializeData from "../../lib/use-datatool";
import DashboardTable from "./DashboardTable";

interface TableActions {
  dropdownBtn: (id: number) => void;
}

const Controlller = () => {
  const [appointments, appointmentModel] = useModel(path, defaultState, modelConfig, listDataReducer);
  useInitializeData({ functionName: appointmentModel.get });

  const tableActions: TableActions = {
    dropdownBtn: (id: number) => {},
  };

  return (
    <Fragment>
      <Dashboard appointments={appointments.data} />
      <div className="px-4">
        <DashboardTable data={appointments.data} actions={tableActions} />
      </div>
    </Fragment>
  );
};

export default Controlller;
