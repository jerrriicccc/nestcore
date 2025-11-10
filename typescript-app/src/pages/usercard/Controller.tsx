import { Fragment } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import SubHeader from "../../components/layout/SubHeader";
import { defaultState, navButtons, modelConfig, path, useLocalValidation, optionState, optionEndPoints } from "./PageSettings";
import useModel, { useSelectOption } from "../../lib/use-model";
import { cardDataReducer, simpleDataReducer } from "../../lib/functions";
import { useInitializeData, useDataById, useCardFormSubmitHandler } from "../../lib/use-datatool";
import AuthorizationAlert from "../authorization/AuthorizationAlert";
import UserForm from "./UserForm";

interface InputType {
  name: string;
  value: string | number | (string | number)[];
  inputType: "select-single" | "select-multi";
}

const Controller = () => {
  const { mode = "create" } = useParams<{ mode?: "create" | "update" }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [user, userModel] = useModel(path, defaultState, modelConfig, cardDataReducer);
  const [getRole, getRoleOptions] = useSelectOption(path, optionState, optionEndPoints.roles, simpleDataReducer);

  const getUserById = useDataById({
    callbackFunction: userModel.get,
    id: Number(id),
    options: {
      action: "read",
      preventZeroValue: true,
    },
  });
  useInitializeData({
    functionName: getUserById,
    args: mode === "update" && id ? Number(id) : undefined,
  });

  useInitializeData({
    functionName: getRoleOptions,
    args: "roles",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | InputType) => {
    if ("target" in e) {
      const { name, value } = e.target;
      userModel.dataDispatch({
        type: "updateField",
        response: { name, value },
      });
    } else {
      const { name, value, inputType } = e;
      userModel.dataDispatch({
        type: "updateField",
        response: { name, value, inputType: inputType as "select-single" | "select-multi" },
      });
    }
  };

  const cardSubmitHandler = useCardFormSubmitHandler({
    validateFn: useLocalValidation,
    data: {
      email: user.data.email,
      assignedroles: user.data.assignedroles,
      defaultroleid: user.data.defaultroleid,
      id: mode === "update" ? Number(id) : undefined,
    },
    model: userModel,
    mode,
    options: {
      dispatchRequest: true,
      onSuccess: () => {
        navigate("/userlist", {
          state: {
            showAlert: true,
            alertMessage: {
              severity: "success",
              title: "Success",
              message: mode === "create" ? "User created successfully!" : "User updated successfully!",
            },
          },
        });
      },
    },
  });

  const handleSubmit = async () => {
    const proceed = window.confirm("Are you sure you want to submit this form?");
    if (proceed) {
      await cardSubmitHandler();
    }
  };

  return (
    <Fragment>
      <SubHeader title={`User Form | ${mode.toUpperCase()}`} buttons={navButtons} />
      <AuthorizationAlert />
      <UserForm data={user.data} onChange={handleChange} onSubmit={handleSubmit} selectOptions={{ roles: getRole.data }} />
    </Fragment>
  );
};

export default Controller;
