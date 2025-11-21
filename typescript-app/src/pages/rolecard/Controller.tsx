import { Fragment, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import SubHeader from "../../components/layout/SubHeader";
import RoleForm from "./RoleForm";
import GlobalRecordAccessForm from "./GlobalRecordAccessForm";
import ModuleAccessForm from "./ModuleAccessForm";
import AuthorizationAlert from "../authorization/AuthorizationAlert";
import { defaultState, navButtons, modelConfig, path, useLocalValidation } from "./PageSettings";
import useModel from "../../lib/use-model";
import { cardDataReducer } from "../../lib/functions";
import { useInitializeData, useDataById, useCardFormSubmitHandler, useUpdateField, useDataStatusListener } from "../../lib/use-datatool";
import useGlobalRecordAccessModel from "../../models/use-globalrecordaccessmodel";
import useRoleModel from "../../models/use-rolemodel";
import useModuleAccessModel from "../../models/use-moduleaccessmodel";

// Types
interface UpdateObject {
  type: string;
  id: number;
  field: "accessvalue" | "grantypeid";
  value: string | number | (string | number)[];
}

// interface GlobalRecordAccessData {
//   id: number;
//   accesskey: string;
//   accessvalue: string[];
//   grantypeid: number;
//   roleid?: string;
//   typeid?: string;
//   parentkey?: string;
// }

interface UpdateData {
  id: number;
  accessvalue?: string[];
  grantypeid?: number;
}

const Controller = () => {
  // Hooks
  const navigate = useNavigate();
  const { mode = "create" } = useParams<{ mode?: "create" | "update" }>();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  // Models
  const [role, roleModel, roleStatus] = useModel(path, defaultState, modelConfig, cardDataReducer);
  const updateRoleField = useUpdateField({ callbackFunction: roleModel.setData });
  const { dataState: globalRecordAccess, dataStatus: globalRecAccessStatus, ...globalRAccessModel } = useGlobalRecordAccessModel();
  const [models, modelsModel] = useRoleModel();

  const { dataState: moduleAccess, dataStatus: moduleAccessStatus, ...moduleAccessModel } = useModuleAccessModel();
  // const [moduleOptions, moduleOptionsModel] = useRoleModel();

  // getallaccessoption
  // const [getAllAccessOption, getAllAccessOptionModel, getAllAccessOptionStatus] = useModel(path, defStatAccessDetails, modelConfigGetAllOptions, listDataReducer);
  // useInitializeData({
  //   functionName: getAllAccessOptionModel.get,
  //   args: { requestData: { model: "appointmentstatuses" } },
  // });

  console.log("models", models);

  // Data Fetching Functions
  const getGlobalRAccess = () => {
    if (mode === "update" && id) {
      globalRAccessModel.get({
        requestData: {
          searchcond: {
            roleid: Number(id),
            typeid: 1,
            parentkey: "",
          },
        },
      });
    }
  };

  const getModuleAccess = () => {
    if (mode === "update" && id) {
      moduleAccessModel.get({
        requestData: {
          searchcond: {
            roleid: Number(id),
            typeid: [2, 3],
          },
        },
      });
    }
  };

  const getModelContents = () => {
    if (globalRecordAccess.data.length > 0) {
      globalRecordAccess.data.forEach((data: any) => {
        getModelValues(data.accesskey);
      });
    }
  };
  const getModelValues = (model: string) => {
    if (!(model in models.data)) {
      modelsModel.get({
        action: "read",
        requestData: { model: model },
        dispatchRequest: true,
      });
    }
  };
  // const getModelValuesModule = (model: string) => {
  //   if (!(model in moduleAccess.data)) {
  //     moduleAccessModel.get({
  //       action: "read",
  //       requestData: { model: model },
  //       dispatchRequest: true,
  //     });
  //   }
  // };
  // const getModelContents = () => {
  //   if (globalRecordAccess?.data?.length > 0) {
  //     // Get unique accesskeys to avoid duplicate requests
  //     const uniqueAccessKeys: string[] = Array.from(new Set(globalRecordAccess.data.map((data: GlobalRecordAccessData) => data.accesskey)));

  //     // Initialize all options data immediately
  //     uniqueAccessKeys.forEach((accesskey: string) => {
  //       getModelValues(accesskey);
  //     });
  //   }
  // };

  const getRoleById = useDataById({
    callbackFunction: roleModel.get,
    id: Number(id),
    options: {
      action: "read",
      preventZeroValue: true,
    },
  });

  // Helper Functions
  const prepareUpdateData = (object: UpdateObject): UpdateData => {
    const updateData: UpdateData = { id: object.id };

    if (object.field === "accessvalue") {
      updateData.accessvalue = Array.isArray(object.value) ? object.value.map(String) : [String(object.value)];
    } else if (object.field === "grantypeid") {
      updateData.grantypeid = Number(object.value);
    }

    return updateData;
  };

  // Event Handlers
  const globalRAccessOnChange = (object: UpdateObject) => {
    if (object.type === "updatefield") {
      globalRAccessModel.setData(object, "updatefield");

      const updateData = prepareUpdateData(object);

      globalRAccessModel.put(
        {
          requestData: updateData,
          action: "update",
        },
        {
          dispatchRequest: true,
          onSuccess: () => {
            getGlobalRAccess();
          },
        }
      );
    }
  };

  const moduleAccessOnChange = (object: UpdateObject) => {
    if (object.type === "updatefield") {
      moduleAccessModel.setData(object, "updatefield");

      const updateData = prepareUpdateData(object);

      moduleAccessModel.put(
        {
          requestData: updateData,
          action: "update",
        },
        {
          dispatchRequest: true,
          onSuccess: () => {
            getModuleAccess();
          },
        }
      );
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const roleCardSubmitHandler = async () => {
    const proceed = window.confirm("Are you sure you want to submit this form?");
    if (proceed) {
      await cardSubmitHandler();
    }
  };

  // Form Submission
  const cardSubmitHandler = useCardFormSubmitHandler({
    validateFn: useLocalValidation,
    data: {
      ...role.data,
      id: mode === "update" ? Number(id) : undefined,
    },
    model: roleModel,
    mode,
    options: {
      dispatchRequest: true,
      onSuccess: () => {
        navigate("/rolelist", {
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

  useInitializeData({
    functionName: getRoleById,
    args: mode === "update" && id ? Number(id) : undefined,
  });

  useInitializeData({
    functionName: getGlobalRAccess,
    args: mode === "update" && id ? Number(id) : undefined,
  });
  useEffect(getModelContents, [globalRecordAccess.data]);

  useInitializeData({
    functionName: getModuleAccess,
    args: mode === "update" && id ? Number(id) : undefined,
  });

  useDataStatusListener({
    statusState: globalRecAccessStatus,
    action: "update",
    status: "success",
    callbackFunction: getGlobalRAccess,
  });

  useDataStatusListener({
    statusState: moduleAccessStatus,
    action: "update",
    status: "success",
    callbackFunction: getModuleAccess,
  });

  const rdata = Array.isArray(globalRecordAccess.data) ? globalRecordAccess.data : [];
  const mdata = Array.isArray(moduleAccess.data) ? moduleAccess.data : [];

  // Transform mdata availableOptions arrays into selectOptions format
  // The availableOptions array contains the available choices that users can select from
  const moduleSelectOptions = mdata.reduce((acc: Record<string, { value: string; label: string }[]>, item: any) => {
    if (item.accesskey && Array.isArray(item.availableOptions)) {
      // Use the availableOptions array as the available options
      acc[item.accesskey.toLowerCase()] = item.availableOptions.map((value: string) => ({
        value: value,
        label: value, // Display the same value as label for now
      }));
    }
    return acc;
  }, {});

  // Transform mdata to preserve existing selections or start with empty if no selections exist
  const mdataWithEmptySelections = mdata.map((item: any) => ({
    ...item,
    availableOptions: item.availableOptions || [], // Available options from backend
  }));

  return (
    <Fragment>
      <SubHeader title={`Role Form | ${mode.toUpperCase()}`} buttons={navButtons} actions={{ btnBack: handleBack }} />
      <AuthorizationAlert status={roleStatus} dependsOn={["read", "create", "update"]} />

      <Row className="g-0">
        <Col md={4} className="pe-2">
          <RoleForm data={role.data} onChange={updateRoleField} onSubmit={roleCardSubmitHandler} />
        </Col>
        <Col md={8} className="ps-2">
          <GlobalRecordAccessForm
            data={rdata}
            actions={{
              onChange: globalRAccessOnChange,
              onMenuOpen: () => {},
            }}
            selectOptions={models.data}
          />
        </Col>
      </Row>
      <ModuleAccessForm data={mdataWithEmptySelections} actions={{ onChange: moduleAccessOnChange, onMenuOpen: () => {} }} selectOptions={moduleSelectOptions} />
    </Fragment>
  );
};

export default Controller;
