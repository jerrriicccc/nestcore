import { useParams, useSearchParams } from "react-router-dom";
import { navButtons, path, route, defaultState, modelConfig, optionState, optionEndPoints, useLocalValidation } from "./PageSettings";
import { cardDataReducer, simpleDataReducer } from "../../lib/functions";

import { useInitializeData, useUpdateField, useRedirectByDataStatus, useCardFormSubmitHandler, useDataByCriteria } from "../../lib/use-datatool";
import useModel from "../../lib/use-model";
import { useSelectOptionAuto } from "../../lib/use-selectoption";
import SwitchRoleForm from "./SwitchRoleForm";
import SubHeader from "../../components/layout/SubHeader";
import { Fragment } from "react/jsx-runtime";

const Controller = () => {
  const { mode } = useParams();
  const currentMode = (mode as "create" | "update") || "update";
  const [account, accountModel, accountStatus] = useModel(path, defaultState, modelConfig, cardDataReducer);
  const [myRoles] = useSelectOptionAuto({ path, endPoint: optionEndPoints.myroles });

  const cardSubmitHandler = useCardFormSubmitHandler({ validateFn: useLocalValidation, data: account.data, model: accountModel, mode: currentMode });
  const updateCustomerField = useUpdateField({ callbackFunction: accountModel.setData });

  useInitializeData({ functionName: accountModel.get });
  useRedirectByDataStatus({ path: route.authorization, statusState: accountStatus, action: currentMode, status: "success" });

  return (
    <Fragment>
      <SubHeader title="Switch Role" />
      <SwitchRoleForm data={account.data} selectOptions={{ myRole: myRoles.data }} onChange={updateCustomerField} onSubmit={cardSubmitHandler} />
    </Fragment>
  );
};

export default Controller;
