import { Fragment, useCallback, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import UserTable from "./UserTable";
import SubHeader from "../../components/layout/SubHeader";
import { path, defaultState, modelConfig, navButton, listTable } from "./PageSettings";
import SearchPane from "../../components/SearchPane";
import Pagination from "../../components/Pagination";
import useModel from "../../lib/use-model";
import { listDataReducer } from "../../lib/functions";
import { useDataById, useDataBySearchParams, useDataStatusListener, useInitializeData, useRedirectOnErrorStatus, useSimpleConfirmDelete } from "../../lib/use-datatool";
import AuthorizationAlert from "../authorization/AuthorizationAlert";
import { useFilter } from "../../lib/use-filter";
import { AlertMessages } from "../../components/alert/AlertMessage";
import FilterButton from "../../components/FilterButton";
import { Box, CircularProgress } from "@mui/material";

type AlertSeverity = "success" | "error" | "warning" | "info";

interface AlertMessage {
  severity: AlertSeverity;
  title: string;
  message: string;
}

interface TableActions {
  delete: (id: number) => void;
  update: (id: number) => void;
}

// CONSTANTS
const STORAGE_KEY = "UserTableOrder";

const Controller = () => {
  // ROUTER HOOKS
  const [searchParams, setSearchParams] = useSearchParams();

  // URL PARAMETERS
  const id = searchParams.get("id");
  const page = Number(searchParams.get("page")) || 1;
  const searchCond = searchParams.get("searchcond") || "";

  // MODEL
  const [user, userModel, userStatus] = useModel(path, defaultState, modelConfig, listDataReducer);

  // DATA FETCHING IF ID IS PRESENT
  const getUserById = useDataById({ callbackFunction: userModel.getById, id: Number(id), options: { preventZeroValue: true, action: "read" } });

  // STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

  //TABLE FILTER HOOK
  const { visibleColumns, columnOrder, handleColumnVisibilityChange, handleColumnOrderChange } = useFilter({
    columns: listTable.columns,
    storageKey: STORAGE_KEY,
  });

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

  const sendDeleteRequest = useSimpleConfirmDelete({
    delFn: userModel.delete,
    onSuccess: async () => {
      setAlertMessage(null);
      setTimeout(() => {
        setAlertMessage({
          severity: "success",
          title: "Success",
          message: "User deleted successfully!",
        });
      }, 50);

      await userModel.get();
    },
  });

  const getDeleteById = (id: number) => {
    const proceed = window.confirm("Are you sure?");
    if (proceed) {
      sendDeleteRequest({ row: { id: id } });
    }
  };

  const [fetchData] = useDataBySearchParams({ callbackFunction: userModel.get, searchParam: "searchcond" });

  useInitializeData({
    functionName: () => {
      if (typeof fetchData === "function") {
        fetchData();
      }
    },
    deps: [page, searchCond],
  });

  // INITIALIZE DATA
  useInitializeData({ functionName: getUserById, args: { id: Number(id) } });
  useDataStatusListener({ statusState: userStatus, action: "read", status: "success", callbackFunction: () => setIsLoading(false) });
  useRedirectOnErrorStatus({ path: "/", statusState: userStatus, action: "read", errorCode: 401 });

  // DERIVED VALUES
  const tableActions: TableActions = {
    delete: getDeleteById,
    update: getUserById,
  };

  return (
    <Fragment>
      <SubHeader
        title="User List"
        buttons={navButton}
        filterButton={
          <FilterButton
            columns={listTable.columns as { label: string; id: string; hidden?: boolean }[]}
            visibleColumns={visibleColumns}
            onColumnVisibilityChange={handleColumnVisibilityChange}
            onColumnOrderChange={handleColumnOrderChange}
            columnOrder={columnOrder}
          />
        }
        searchPane={<SearchPane onSearch={handleSearch} />}
      />
      {alertMessage && <AlertMessages {...alertMessage} />}

      <AuthorizationAlert />
      <div className="px-4">
        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <UserTable data={user?.data || []} actions={tableActions} visibleColumns={visibleColumns} columnOrder={columnOrder} />
        )}
        <div className="d-flex justify-content-center">
          <Pagination settings={user?.meta} disabled={isLoading} />
        </div>
      </div>
    </Fragment>
  );
};

export default Controller;
