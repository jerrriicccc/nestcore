import { Fragment } from "react";
import SubHeader from "../../components/layout/SubHeader";
// import AuthorizationAlert from "../../components/layout/AuthorizationAlert";
import Links from "./Links";

const Controller = () => {
  return (
    <Fragment>
      <SubHeader title="Settings" />
      <Links />
      {/* <AuthorizationAlert /> */}
    </Fragment>
  );
};

export default Controller;
