import { Fragment, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import SubHeader from "../../components/layout/SubHeader";
import CustomerForm from "./CustomerForm";
import { defaultState, navButtons, modelConfig, path, useLocalValidation, optionState, optionEndPoints } from "./PageSettings";
import useModel, { useSelectOption } from "../../lib/use-model";
import { cardDataReducer, simpleDataReducer } from "../../lib/functions";
import { useInitializeData, useDataById, useCardFormSubmitHandler } from "../../lib/use-datatool";
import AuthorizationAlert from "../authorization/AuthorizationAlert";
import { AlertMessages } from "../../components/alert/AlertMessage";

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

  // MODEL
  const [customer, customerModel, customerStatus] = useModel(path, defaultState, modelConfig, cardDataReducer);
  const [status, getStatus] = useSelectOption(path, optionState, optionEndPoints.status, simpleDataReducer);

  useInitializeData({
    functionName: getStatus,
    args: "status",
  });

  const getCustomerById = useDataById({
    callbackFunction: customerModel.get,
    id: Number(id),
    options: {
      action: "read",
      preventZeroValue: true,
    },
  });

  useInitializeData({
    functionName: getCustomerById,
    args: mode === "update" && id ? Number(id) : undefined,
  });

  const cardSubmitHandler = useCardFormSubmitHandler({
    validateFn: useLocalValidation,
    data: {
      ...customer.data,
      id: mode === "update" ? Number(id) : undefined,
    },
    model: customerModel,
    mode,
    options: {
      dispatchRequest: true,
      onSuccess: () => {
        navigate("/customerlist", {
          state: {
            showAlert: true,
            alertMessage: {
              severity: "success",
              title: "Success",
              message: mode === "create" ? "Customer created successfully!" : "Customer updated successfully!",
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
      customerModel.dataDispatch({
        type: "updateField",
        response: { name, value },
      });
    } else {
      const { name, value, inputType } = e;
      customerModel.dataDispatch({
        type: "updateField",
        response: { name, value, inputType: inputType as "select-single" | "select-multi" },
      });
    }
  };

  return (
    <Fragment>
      <SubHeader title={`Customer Form | ${mode.toUpperCase()}`} buttons={navButtons} actions={{ btnBack: handleBack }} />
      <AuthorizationAlert />
      <CustomerForm data={customer.data} onChange={handleChange} onSubmit={handleSubmit} selectOptions={{ statuses: status.data }} />
    </Fragment>
  );
};

export default Controller;
