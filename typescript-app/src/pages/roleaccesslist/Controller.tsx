import { Fragment, useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useLocation } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

// COMPONENTS
import SubHeader from "../../components/layout/SubHeader";
import SearchPane from "../../components/SearchPane";
import Pagination from "../../components/Pagination";
import AuthorizationAlert from "../authorization/AuthorizationAlert";
import { AlertMessages } from "../../components/alert/AlertMessage";
import FilterButton from "../../components/FilterButton";
import RoleAccessTable from "./RoleAccessTable";

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

const STORAGE_KEY = "RoleTableOrder";

const Controller = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const id = searchParams.get("id");
  const page = Number(searchParams.get("page")) || 1;
  const searchCond = searchParams.get("searchcond") || "";

  // MODEL
  const [roleAccess, roleAccessModel, roleAccessStatus] = useModel(path, defaultState, modelConfig, listDataReducer);
  const [fetchData] = useDataBySearchParams({ callbackFunction: roleAccessModel.get, searchParam: "searchcond" });

  // STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

  // DELETE HANDLER
  const sendDeleteRequest = useSimpleConfirmDelete({
    delFn: roleAccessModel.delete,
    onSuccess: async () => {
      setAlertMessage(null);
      setTimeout(() => {
        setAlertMessage({
          severity: "success",
          title: "Success",
          message: "Role access deleted successfully!",
        });
      }, 50);

      await roleAccessModel.get();
    },
  });

  const getDeleteById = (id: number) => {
    const proceed = window.confirm("Are you sure?");
    if (proceed) {
      sendDeleteRequest({ row: { id } });
    }
  };

  // DATA FETCHING IF ID IS PRESENT
  const getRoleAccessById = useDataById({ callbackFunction: roleAccessModel.getById, id: Number(id), options: { preventZeroValue: true, action: "read" } });

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
  useInitializeData({ functionName: getRoleAccessById, args: { id: Number(id) } });
  useDataStatusListener({ statusState: roleAccessStatus, action: "read", status: "success", callbackFunction: () => setIsLoading(false) });
  useRedirectOnErrorStatus({ path: "/", statusState: roleAccessStatus, action: "read", errorCode: 401 });

  // DERIVED VALUES
  const tableActions: TableActions = {
    delete: getDeleteById,
    update: getRoleAccessById,
  };

  return (
    <Fragment>
      <SubHeader title="Role Access List" buttons={navButton} />
      {alertMessage && <AlertMessages {...alertMessage} />}
      <AuthorizationAlert status={roleAccessStatus} dependsOn={["read", "create", "update", "delete"]} />

      {/* TABLE */}
      <div className="px-4">
        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <RoleAccessTable data={roleAccess?.data || []} actions={tableActions} />
        )}
      </div>

      {/* PAGINATION */}
      {!isLoading && roleAccess.data.length > 0 && (
        <div className="d-flex justify-content-center ">
          <Pagination settings={roleAccess.meta} disabled={isLoading} />
        </div>
      )}
    </Fragment>
  );
};

export default Controller;
