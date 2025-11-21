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
import RoleTable from "./RoleTable";

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
const STORAGE_KEY = "RoleTableOrder";

const Controller = () => {
  // ROUTER HOOKS
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // URL PARAMETERS
  const id = searchParams.get("id");
  const page = Number(searchParams.get("page")) || 1;
  const searchCond = searchParams.get("searchcond") || "";

  // MODEL
  const [role, roleModel, roleStatus] = useModel(path, defaultState, modelConfig, listDataReducer);
  const [fetchData] = useDataBySearchParams({ callbackFunction: roleModel.get, searchParam: "searchcond" });

  // STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

  // DELETE HANDLER
  const sendDeleteRequest = useSimpleConfirmDelete({
    delFn: roleModel.delete,
    onSuccess: async () => {
      setAlertMessage(null);
      setTimeout(() => {
        setAlertMessage({
          severity: "success",
          title: "Success",
          message: "Role deleted successfully!",
        });
      }, 50);

      await roleModel.get();
    },
  });

  const getDeleteById = (id: number) => {
    const proceed = window.confirm("Are you sure?");
    if (proceed) {
      sendDeleteRequest({ row: { id } });
    }
  };

  // DATA FETCHING IF ID IS PRESENT
  const getRoleById = useDataById({ callbackFunction: roleModel.getById, id: Number(id), options: { preventZeroValue: true, action: "read" } });

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
  useInitializeData({ functionName: getRoleById, args: { id: Number(id) } });
  useDataStatusListener({ statusState: roleStatus, action: "read", status: "success", callbackFunction: () => setIsLoading(false) });
  useRedirectOnErrorStatus({ path: "/", statusState: roleStatus, action: "read", errorCode: 401 });

  // DERIVED VALUES
  const tableActions: TableActions = {
    delete: getDeleteById,
    update: getRoleById,
  };

  return (
    <Fragment>
      <SubHeader title="Role List" buttons={navButton} />
      {alertMessage && <AlertMessages {...alertMessage} />}
      <AuthorizationAlert status={roleStatus} dependsOn={["read", "update", "delete"]} />

      {/* TABLE */}
      <div className="px-4">
        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <RoleTable data={role?.data || []} actions={tableActions} />
        )}
      </div>

      {/* PAGINATION */}
      {!isLoading && role.data.length > 0 && (
        <div className="d-flex justify-content-center ">
          <Pagination settings={role.meta} disabled={isLoading} />
        </div>
      )}
    </Fragment>
  );
};

export default Controller;
