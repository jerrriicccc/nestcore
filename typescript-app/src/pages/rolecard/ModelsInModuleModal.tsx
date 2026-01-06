import MyModal from "../../components/MyModal";
import ModelsInModuleTable from "./ModelsInModuleTable";
import React from "react";

interface ModelsInModuleModalProps {
  show: boolean;
  onHide?: () => void;
  setState?: (v: boolean) => void;
  data?: any[];
  selectOptions?: Record<string, any[]>;
  actions?: any;
  modalProps?: Record<string, any>;
}

const ModelsInModuleModal: React.FC<ModelsInModuleModalProps> = (props) => {
  const modalProps = { size: "lg", "aria-labelledby": "contained-modal-title-vcenter", centered: true };
  const body = <ModelsInModuleTable {...props} />;
  return <MyModal title="Models" {...props} modalProps={modalProps} body={body} />;
};

export default ModelsInModuleModal;
