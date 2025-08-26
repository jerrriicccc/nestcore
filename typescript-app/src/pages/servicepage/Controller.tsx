import { Fragment } from "react";
import useModel from "../../lib/use-model";
import { listDataReducer } from "../../lib/functions";
import { useInitializeData } from "../../lib/use-datatool";
import { path, defaultState, modelConfig, path2, defaultState2, modelConfig2, path3, defaultState3, modelConfig3 } from "./PageSettings";

import ServicesPage from "./ServicesPage";

const Controller = () => {
  const [groomData, groomDataModel] = useModel(path, defaultState, modelConfig, listDataReducer);
  const [dayCareData, dayCareDataModel] = useModel(path2, defaultState2, modelConfig2, listDataReducer);
  const [addServiceData, addServiceDataModel] = useModel(path3, defaultState3, modelConfig3, listDataReducer);

  useInitializeData({ functionName: groomDataModel.get, args: {} });
  useInitializeData({ functionName: dayCareDataModel.get, args: {} });
  useInitializeData({ functionName: addServiceDataModel.get, args: {} });

  return (
    <Fragment>
      <ServicesPage groomData={groomData.data} dayCareData={dayCareData.data} addSerData={addServiceData.data} />
    </Fragment>
  );
};

export default Controller;
