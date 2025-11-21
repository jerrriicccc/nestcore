import { Fragment, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import SubHeader from "../../components/layout/SubHeader";
import AppointmentForm from "./AppointmentForm";
import { defaultState, navButtons, modelConfig, path, useLocalValidation, optionState, optionEndPoints } from "./PageSettings";
import useModel, { useSelectOption } from "../../lib/use-model";
import { cardDataReducer } from "../../lib/functions";
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

  const [appointment, appointmentModel, appointmentStatus] = useModel(path, defaultState, modelConfig, cardDataReducer);

  // console.log("appointmentStatuscard", appointmentStatus);

  useEffect(() => {
    const action = appointmentStatus?.action;
    const status = appointmentStatus?.status;

    if (action === "create" || action === "update") {
      if (status === "error") {
        const errorMessage = appointmentStatus?.body?.response?.message;
        navigate("/appointmentlist", {
          state: {
            showAlert: true,
            alertMessage: {
              severity: "error",
              title: "Error",
              message: errorMessage,
            },
          },
        });
      } else if (status === "success") {
        navigate("/appointmentlist", {
          state: {
            showAlert: true,
            alertMessage: {
              severity: "success",
              title: "Success",
              message: action === "create" ? "Appointment created successfully!" : "Appointment updated successfully!",
            },
          },
        });
      }
    }
  }, [appointmentStatus, navigate]);

  const getappointmentById = useDataById({
    callbackFunction: appointmentModel.get,
    id: Number(id),
    options: {
      action: "read",
      preventZeroValue: true,
    },
  });

  useInitializeData({
    functionName: getappointmentById,
    args: mode === "update" && id ? Number(id) : undefined,
  });

  const cardSubmitHandler = useCardFormSubmitHandler({
    validateFn: useLocalValidation,
    data: {
      ...appointment.data,
      id: mode === "update" ? Number(id) : undefined,
    },
    model: appointmentModel,
    mode,
    options: {
      dispatchRequest: true,
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
      appointmentModel.dataDispatch({
        type: "updateField",
        response: { name, value },
      });
    } else {
      const { name, value, inputType } = e;
      appointmentModel.dataDispatch({
        type: "updateField",
        response: { name, value, inputType: inputType as "select-single" | "select-multi" },
      });
    }
  };

  return (
    <Fragment>
      <SubHeader title={`Appointment Form | ${mode.toUpperCase()}`} buttons={navButtons} actions={{ btnBack: handleBack }} />
      <AuthorizationAlert status={appointmentStatus} dependsOn={["read", "create", "update"]} />

      <AppointmentForm data={appointment.data} onChange={handleChange} onSubmit={handleSubmit} />
    </Fragment>
  );
};

export default Controller;
