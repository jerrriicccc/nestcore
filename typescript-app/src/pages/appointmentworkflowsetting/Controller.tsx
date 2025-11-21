import { Fragment, useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

// COMPONENTS
import WorkflowSettingTable from "./WorkflowSettingTable";
import SubHeader from "../../components/layout/SubHeader";
import SearchPane from "../../components/SearchPane";
import Pagination from "../../components/Pagination";
import AuthorizationAlert from "../authorization/AuthorizationAlert";
import { AlertMessages } from "../../components/alert/AlertMessage";

// HOOKS AND UTILS
import useModel, { useSelectOption } from "../../lib/use-model";
import { listDataReducer, cardDataReducer, simpleDataReducer } from "../../lib/functions";
import { useInitializeData, useSimpleConfirmDelete, useDataById, useDataBySearchParams, useDataStatusListener, useRedirectOnErrorStatus, useCardFormSubmitHandler } from "../../lib/use-datatool";
import { useAlert } from "../../context/AlertContext";

// SETTINGS
import { path, defaultState, modelConfig, useLocalValidation, defaultStateCard, modelConfigCard, navButtons, optionState, optionEndPoints } from "./PageSettings";

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
  const { alert: alertMessage, setAlert: setAlertMessage } = useAlert();

  useEffect(() => {
    setAlertMessage(null);
  }, []);

  // MODEL
  const [appointmentWorkflowSettForm, appointmentWorkflowSettFormModel] = useModel(path, defaultStateCard, modelConfigCard, cardDataReducer);
  const [getApptStatus, getApptStatusOptions] = useSelectOption(path, optionState, optionEndPoints.appointmentstat, simpleDataReducer);

  useInitializeData({
    functionName: getApptStatusOptions,
    args: "appointmentstatus",
  });

  const cardSubmitHandler = useCardFormSubmitHandler({
    validateFn: useLocalValidation,
    data: {
      ...appointmentWorkflowSettForm.data,
      id: mode === "update" ? Number(id) : undefined,
    },
    model: appointmentWorkflowSettFormModel,
    mode,
    options: {
      dispatchRequest: true,
      onSuccess: () => {
        // // if (typeof fetchData === "function") fetchData();

        const alertPayload = {
          severity: mode === "create" ? ("success" as const) : ("success" as const),
          title: "Success",
          message: mode === "create" ? "Successfully created!" : "Successfully updated!",
          key: Date.now(),
        };

        appointmentWorkflowSettFormModel.dataDispatch({
          type: "updateField",
          response: { name: "mode", value: "create" },
        });

        setAlertMessage(alertPayload);
        emptyFormFields();
        navigate("/appointmentworkflowsetting/create");
      },
    },
  });

  const handleSubmit = async () => {
    const proceed = window.confirm("Are you sure you want to submit this form?");
    if (proceed) {
      await cardSubmitHandler();
      await appointmentWorkflowSettTableModel.get();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | InputType) => {
    if ("target" in e) {
      const { name, value } = e.target;
      appointmentWorkflowSettFormModel.dataDispatch({
        type: "updateField",
        response: { name, value },
      });
    } else {
      const { name, value, inputType } = e;
      appointmentWorkflowSettFormModel.dataDispatch({
        type: "updateField",
        response: { name, value, inputType: inputType as "select-single" | "select-multi" },
      });
    }
  };

  const emptyFormFields = () => {
    appointmentWorkflowSettFormModel.dataDispatch({
      type: "reset",
      response: defaultStateCard.data,
    });
  };

  const handleCancel = () => {
    emptyFormFields();
    appointmentWorkflowSettFormModel.dataDispatch({
      type: "updateField",
      response: { name: "mode", value: "create" },
    });
    navigate("/appointmentworkflowsetting/create");
  };

  /** --------------------------------  TABLE DATA INITIALIZATION ------------------------------------  **/

  // ROUTER HOOKS

  // MODEL
  const [appointmentWorkflowSettTable, appointmentWorkflowSettTableModel, appointmentWorkflowSettTableStatus] = useModel(path, defaultState, modelConfig, listDataReducer);
  // const [fetchData] = useDataBySearchParams({ callbackFunction: appointmentWorkflowSettTableModel.get, searchParam: "searchcond" });

  // STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(false);

  // DELETE HANDLER
  const sendDeleteRequest = useSimpleConfirmDelete({
    delFn: appointmentWorkflowSettTableModel.delete,
    onSuccess: async () => {
      setAlertMessage(null);
      setTimeout(() => {
        setAlertMessage({
          severity: "success",
          title: "Success",
          message: "Deleted successfully!",
        });
      }, 90);

      await appointmentWorkflowSettTableModel.get();
    },
  });

  const getDeleteById = (id: number) => {
    const proceed = window.confirm("Are you sure?");
    if (proceed) {
      sendDeleteRequest({ row: { id } });
    }
  };

  // DATA FETCHING IF ID IS PRESENT
  const getServiceById = useDataById({ callbackFunction: appointmentWorkflowSettFormModel.get, id: Number(id), options: { preventZeroValue: true, action: "read" } });

  // FETCH DATA ON PAGE/SEARCH CHANGE
  useInitializeData({
    functionName: () => {
      appointmentWorkflowSettTableModel.get();
    },
  });

  // INITIALIZE DATA
  useInitializeData({
    functionName: getServiceById,
    args: mode === "update" && id ? Number(id) : undefined,
    deps: [mode, id],
  });
  useDataStatusListener({ statusState: appointmentWorkflowSettTableStatus, action: "read", status: "success", callbackFunction: () => setIsLoading(false) });
  useRedirectOnErrorStatus({ path: "/", statusState: appointmentWorkflowSettTableStatus, action: "read", errorCode: 401 });

  // DERIVED VALUES
  const tableActions: TableActions = {
    delete: getDeleteById,
    update: getServiceById,
  };

  const handleBack = () => {
    navigate(-1);
  };
  return (
    <Fragment>
      <SubHeader title="Workflow" buttons={navButtons} actions={{ btnBack: handleBack }} />
      {alertMessage && <AlertMessages {...alertMessage} alertKey={alertMessage.key} key={alertMessage.key} />}
      <AuthorizationAlert status={appointmentWorkflowSettTableStatus} dependsOn={["read", "create", "update", "delete"]} />

      {/* TABLE */}
      <div className="px-4">
        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <WorkflowSettingTable
              data={appointmentWorkflowSettTable?.data || []}
              actions={tableActions}
              formData={appointmentWorkflowSettForm.data}
              onChange={handleChange}
              onSubmit={handleSubmit}
              handleCancelEditForm={handleCancel}
              selectOptions={{ appointmentstat: getApptStatus.data }}
            />
          </>
        )}
      </div>

      {/* PAGINATION */}
      {!isLoading && appointmentWorkflowSettTable.data.length > 0 && (
        <div className="d-flex justify-content-center ">
          <Pagination settings={appointmentWorkflowSettTable.meta} disabled={isLoading} />
        </div>
      )}
    </Fragment>
  );
};

export default Controller;
