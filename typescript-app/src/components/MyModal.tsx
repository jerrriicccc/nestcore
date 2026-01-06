import React, { ReactNode } from "react";
import { Modal } from "react-bootstrap";

interface MyModalProps {
  show: boolean;
  onHide?: () => void;
  setState?: (v: boolean) => void;
  title?: ReactNode | string;
  body?: ReactNode | string;
  footer?: ReactNode | string;
  modalProps?: Record<string, any>;
}

const MyModal: React.FC<MyModalProps> = ({ show, onHide, setState, title = "", body = "", footer = "", modalProps = {} }) => {
  const closeHandler = () => {
    if (typeof onHide === "function") return onHide();
    if (typeof setState === "function") return setState(false);
    return undefined;
  };

  return (
    <div>
      <Modal show={show} onHide={closeHandler} {...modalProps}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        {body !== "" && <Modal.Body>{body}</Modal.Body>}
        {footer !== "" && <Modal.Footer>{footer}</Modal.Footer>}
      </Modal>
    </div>
  );
};

export default MyModal;
