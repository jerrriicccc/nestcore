import { Fragment, useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useLocation } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

// COMPONENTS
import AppointmentTable from "./AppointmentTable";
import SubHeader from "../../components/layout/SubHeader";
import SearchPane from "../../components/SearchPane";
import Pagination from "../../components/Pagination";
import AuthorizationAlert from "../authorization/AuthorizationAlert";
import { AlertMessages } from "../../components/alert/AlertMessage";
import FilterButton from "../../components/FilterButton";

// HOOKS AND UTILS
import useModel from "../../lib/use-model";
import { useFilter } from "../../lib/use-filter";
import { listDataReducer } from "../../lib/functions";
import { useInitializeData, useSimpleConfirmDelete, useDataById, useDataBySearchParams, useDataStatusListener, useRedirectOnErrorStatus } from "../../lib/use-datatool";

// SETTINGS
import { path, defaultState, modelConfig, navButton, listTable } from "./PageSettings";

// TYPES

interface TableActions {
  delete: (id: number) => void;
  update: (id: number) => void;
}

type AlertSeverity = "success" | "error" | "warning" | "info";

interface AlertMessage {
  severity: AlertSeverity;
  title: string;
  message: string;
}

// CONSTANTS
const STORAGE_KEY = "AppointmentTableOrder";

const Controller = () => {
  // ROUTER HOOKS
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // URL PARAMETERS
  const id = searchParams.get("id");
  const page = Number(searchParams.get("page")) || 1;
  const searchCond = searchParams.get("searchcond") || "";

  // HANDLERS
  const handleSearch = useCallback(
    (searchTerm: string) => {
      setSearchParams((prev) => {
        prev.set("searchcond", searchTerm);
        prev.set("page", "1");
        return prev;
      });
    },
    [setSearchParams]
  );

  // MODEL
  const [appointment, appointmentModel, appointmentStatus] = useModel(path, defaultState, modelConfig, listDataReducer);
  const [fetchData] = useDataBySearchParams({ callbackFunction: appointmentModel.get, searchParam: "searchcond" });

  // STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

  //TABLE FILTER HOOK
  const { visibleColumns, columnOrder, handleColumnVisibilityChange, handleColumnOrderChange } = useFilter({
    columns: listTable.columns,
    storageKey: STORAGE_KEY,
  });

  // DELETE HANDLER
  const sendDeleteRequest = useSimpleConfirmDelete({
    delFn: appointmentModel.delete,
    onSuccess: async () => {
      setAlertMessage(null);
      setTimeout(() => {
        setAlertMessage({
          severity: "success",
          title: "Success",
          message: "Appointment deleted successfully!",
        });
      }, 3000);

      await appointmentModel.get();
    },
  });

  const getDeleteById = (id: number) => {
    const proceed = window.confirm("Are you sure?");
    if (proceed) {
      sendDeleteRequest({ row: { id } });
    }
  };

  // DATA FETCHING IF ID IS PRESENT
  const getappointmentById = useDataById({ callbackFunction: appointmentModel.getById, id: Number(id), options: { preventZeroValue: true, action: "read" } });

  // DISPLAY ALERT MESSAGE
  useInitializeData({
    functionName: () => {
      if (location.state?.showAlert && location.state?.alertMessage) {
        setAlertMessage(location.state.alertMessage);
        window.history.replaceState({}, document.title);
      }
    },
  });

  // FETCH DATA ON PAGE/SEARCH CHANGE
  useInitializeData({
    functionName: () => {
      if (typeof fetchData === "function") {
        fetchData();
      }
    },
    deps: [page, searchCond],
  });

  // INITIALIZE DATA
  useInitializeData({ functionName: getappointmentById, args: { id: Number(id) } });
  useDataStatusListener({ statusState: appointmentStatus, action: "read", status: "success", callbackFunction: () => setIsLoading(false) });
  useRedirectOnErrorStatus({ path: "/", statusState: appointmentStatus, action: "read", errorCode: 401 });

  // DERIVED VALUES
  const tableActions: TableActions = {
    delete: getDeleteById,
    update: getappointmentById,
  };

  return (
    <Fragment>
      <SubHeader
        title="Appointment"
        buttons={navButton}
        // filterButton={
        //   <FilterButton
        //     columns={listTable.columns as { label: string; id: string; hidden?: boolean }[]}
        //     visibleColumns={visibleColumns}
        //     onColumnVisibilityChange={handleColumnVisibilityChange}
        //     onColumnOrderChange={handleColumnOrderChange}
        //     columnOrder={columnOrder}
        //   />
        // }
        // searchPane={<SearchPane onSearch={handleSearch} />}
      />
      {alertMessage && <AlertMessages {...alertMessage} />}
      <AuthorizationAlert />

      {/* TABLE */}
      <div className="px-4">
        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <AppointmentTable data={appointment?.data || []} actions={tableActions} visibleColumns={visibleColumns} columnOrder={columnOrder} />
        )}
      </div>

      {/* PAGINATION */}
      {!isLoading && appointment.data.length > 0 && (
        <div className="d-flex justify-content-center ">
          <Pagination settings={appointment.meta} disabled={isLoading} />
        </div>
      )}
    </Fragment>
  );
};

export default Controller;
