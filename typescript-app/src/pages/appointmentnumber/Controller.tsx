import { Fragment, useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

// COMPONENTS
import AppointmentNumberTable from "./AppointmentNumberTable";
import SubHeader from "../../components/layout/SubHeader";
import SearchPane from "../../components/SearchPane";
import Pagination from "../../components/Pagination";
import AuthorizationAlert from "../authorization/AuthorizationAlert";
import { AlertMessages } from "../../components/alert/AlertMessage";

// HOOKS AND UTILS
import useModel from "../../lib/use-model";
import { listDataReducer, cardDataReducer } from "../../lib/functions";
import { useInitializeData, useSimpleConfirmDelete, useDataById, useDataBySearchParams, useDataStatusListener, useRedirectOnErrorStatus, useCardFormSubmitHandler } from "../../lib/use-datatool";
import { useAlert } from "../../context/AlertContext";

// SETTINGS
import { path, defaultState, modelConfig, useLocalValidation, defaultStateCard, modelConfigCard, navButtons } from "./PageSettings";

// TYPES
type InputType = {
  name: string;
  value: string | number | (string | number)[];
  inputType: "select-single" | "select-multi";
};

interface TableActions {
  delete: (id: number) => void;
  update: (id: number) => void;
}

const Controller = () => {
  /** --------------------------------  FORM DATA INITIALIZATION ------------------------------------  **/
  const navigate = useNavigate();
  const { mode = "create" } = useParams<{ mode?: "create" | "update" }>();
  const [searchParamsById] = useSearchParams();
  const id = searchParamsById.get("id");
  const { alertMessage, setAlertMessage } = useAlert();

  useEffect(() => {
    setAlertMessage(null);
  }, []);

  // MODEL
  const [appointmentNumberForm, appointmentNumberFormModel] = useModel(path, defaultStateCard, modelConfigCard, cardDataReducer);

  const cardSubmitHandler = useCardFormSubmitHandler({
    validateFn: useLocalValidation,
    data: {
      ...appointmentNumberForm.data,
      id: mode === "update" ? Number(id) : undefined,
    },
    model: appointmentNumberFormModel,
    mode,
    options: {
      dispatchRequest: true,
      onSuccess: () => {
        if (typeof fetchData === "function") fetchData();

        const alertPayload = {
          severity: mode === "create" ? ("success" as const) : ("success" as const),
          title: "Success",
          message: mode === "create" ? "Successfully created!" : "Successfully updated!",
          key: Date.now(),
        };

        appointmentNumberFormModel.dataDispatch({
          type: "updateField",
          response: { name: "mode", value: "create" },
        });

        setAlertMessage(alertPayload);
        emptyFormFields();
        navigate("/appointmentnumber/create");
      },
    },
  });

  const handleSubmit = async () => {
    const proceed = window.confirm("Are you sure you want to submit this form?");
    if (proceed) {
      await cardSubmitHandler();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | InputType) => {
    if ("target" in e) {
      const { name, value } = e.target;
      appointmentNumberFormModel.dataDispatch({
        type: "updateField",
        response: { name, value },
      });
    } else {
      const { name, value, inputType } = e;
      appointmentNumberFormModel.dataDispatch({
        type: "updateField",
        response: { name, value, inputType: inputType as "select-single" | "select-multi" },
      });
    }
  };

  const emptyFormFields = () => {
    appointmentNumberFormModel.dataDispatch({
      type: "reset",
      response: defaultStateCard.data,
    });
  };

  const handleCancel = () => {
    emptyFormFields();
    appointmentNumberFormModel.dataDispatch({
      type: "updateField",
      response: { name: "mode", value: "create" },
    });
    navigate("/appointmentnumber/create");
  };

  /** --------------------------------   TABLE DATA INITIALIZATION ------------------------------------  **/

  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const searchCond = searchParams.get("searchcond") || "";

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

  const [appointmentNumberTable, appointmentNumberTableModel, appointmentNumberTableStatus] = useModel(path, defaultState, modelConfig, listDataReducer);
  const [fetchData] = useDataBySearchParams({ callbackFunction: appointmentNumberTableModel.get, searchParam: "searchcond" });

  const [isLoading, setIsLoading] = useState(false);

  const sendDeleteRequest = useSimpleConfirmDelete({
    delFn: appointmentNumberTableModel.delete,
    onSuccess: async () => {
      setAlertMessage(null);
      setTimeout(() => {
        setAlertMessage({
          severity: "success",
          title: "Success",
          message: "Deleted successfully!",
        });
      }, 90);

      await appointmentNumberTableModel.get();
    },
  });

  const getDeleteById = (id: number) => {
    const proceed = window.confirm("Are you sure?");
    if (proceed) {
      sendDeleteRequest({ row: { id } });
    }
  };

  const getServiceById = useDataById({ callbackFunction: appointmentNumberFormModel.get, id: Number(id), options: { preventZeroValue: true, action: "read" } });

  useInitializeData({
    functionName: () => {
      if (typeof fetchData === "function") {
        fetchData();
      }
    },
    deps: [page, searchCond],
  });

  useInitializeData({
    functionName: getServiceById,
    args: mode === "update" && id ? Number(id) : undefined,
    deps: [mode, id],
  });
  useDataStatusListener({ statusState: appointmentNumberTableStatus, action: "read", status: "success", callbackFunction: () => setIsLoading(false) });
  useRedirectOnErrorStatus({ path: "/", statusState: appointmentNumberTableStatus, action: "read", errorCode: 401 });

  const tableActions: TableActions = {
    delete: getDeleteById,
    update: getServiceById,
  };

  const handleBack = () => {
    navigate(-1);
  };
  return (
    <Fragment>
      <SubHeader title="Appointment Number" searchPane={<SearchPane onSearch={handleSearch} />} buttons={navButtons} actions={{ btnBack: handleBack }} />
      {alertMessage && <AlertMessages {...alertMessage} alertKey={alertMessage.key} key={alertMessage.key} />}
      <AuthorizationAlert status={appointmentNumberTableStatus} dependsOn={["read", "create", "update", "delete"]} />

      <div className="px-4">
        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <AppointmentNumberTable
              data={appointmentNumberTable?.data || []}
              actions={tableActions}
              formData={appointmentNumberForm.data}
              onChange={handleChange}
              onSubmit={handleSubmit}
              handleCancelEditForm={handleCancel}
            />
          </>
        )}
      </div>

      {/* PAGINATION */}
      {!isLoading && appointmentNumberTable.data.length > 0 && (
        <div className="d-flex justify-content-center ">
          <Pagination settings={appointmentNumberTable.meta} disabled={isLoading} />
        </div>
      )}
    </Fragment>
  );
};

export default Controller;
