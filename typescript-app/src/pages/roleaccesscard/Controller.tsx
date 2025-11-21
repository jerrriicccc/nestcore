import { Fragment } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import SubHeader from "../../components/layout/SubHeader";
import RoleAccessForm from "./RoleAccessForm";
import { defaultState, navButtons, modelConfig, path, useLocalValidation, optionState, optionEndPoints } from "./PageSettings";
import useModel, { useSelectOption } from "../../lib/use-model";
import { cardDataReducer, simpleDataReducer } from "../../lib/functions";
import { useInitializeData, useDataById, useCardFormSubmitHandler } from "../../lib/use-datatool";
import AuthorizationAlert from "../authorization/AuthorizationAlert";

type InputType = {
  name: string;
  value: string | number | (string | number)[];
  inputType: "select-single" | "select-multi";
};

const Controller = () => {
  const navigate = useNavigate();
  const { mode = "create" } = useParams<{ mode?: "create" | "update" }>();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [roleAccess, roleAccessModel, roleAccessStatus] = useModel(path, defaultState, modelConfig, cardDataReducer);
  const [roleAccessOptions, getroleAccessOptionsStatus] = useSelectOption(path, optionState, optionEndPoints.type, simpleDataReducer);
  const [accessOptions, getAccessOptionsStatus] = useSelectOption(path, optionState, optionEndPoints.access, simpleDataReducer);
  const [modelOptions, getModelOptionsStatus] = useSelectOption(path, optionState, optionEndPoints.model, simpleDataReducer);

  useInitializeData({
    functionName: getroleAccessOptionsStatus,
    args: "type",
  });

  useInitializeData({
    functionName: getAccessOptionsStatus,
    args: "access",
  });

  // useInitializeData({
  //   functionName: getModelOptionsStatus,
  //   args: "model",
  // });

  const getRoleAccessById = useDataById({
    callbackFunction: roleAccessModel.get,
    id: Number(id),
    options: {
      action: "read",
      preventZeroValue: true,
    },
  });

  useInitializeData({
    functionName: getRoleAccessById,
    args: mode === "update" && id ? Number(id) : undefined,
  });

  const cardSubmitHandler = useCardFormSubmitHandler({
    validateFn: useLocalValidation,
    data: {
      ...roleAccess.data,
      id: mode === "update" ? Number(id) : undefined,
    },
    model: roleAccessModel,
    mode,
    options: {
      dispatchRequest: true,
      onSuccess: () => {
        navigate("/roleaccesslist", {
          state: {
            showAlert: true,
            alertMessage: {
              severity: "success",
              title: "Success",
              message: mode === "create" ? "Role created successfully!" : "Role updated successfully!",
            },
          },
        });
      },
    },
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = async () => {
    const proceed = window.confirm("Are you sure you want to submit this form?");
    if (proceed) {
      await cardSubmitHandler();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | InputType) => {
    if ("target" in e) {
      const { name, value } = e.target;
      roleAccessModel.dataDispatch({
        type: "updateField",
        response: { name, value },
      });
    } else {
      const { name, value, inputType } = e;
      roleAccessModel.dataDispatch({
        type: "updateField",
        response: { name, value, inputType: inputType as "select-single" | "select-multi" },
      });
    }
  };

  return (
    <Fragment>
      <SubHeader title={`Role Access Form | ${mode.toUpperCase()}`} buttons={navButtons} actions={{ btnBack: handleBack }} />
      <AuthorizationAlert status={roleAccessStatus} dependsOn={["read", "create", "update"]} />

      <RoleAccessForm data={roleAccess.data} onChange={handleChange} onSubmit={handleSubmit} selectOptions={{ type: roleAccessOptions.data, access: accessOptions.data }} />
    </Fragment>
  );
};

export default Controller;
