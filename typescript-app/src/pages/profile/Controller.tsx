import { Fragment } from "react/jsx-runtime";
import SubHeader from "../../components/layout/SubHeader";
import ProfileForm from "./ProfileForm";
import { useNavigate } from "react-router-dom";

const Controller = () => {
  const navigate = useNavigate();

  const updateProfile = async () => {
    navigate("/profile/update");
  };

  return (
    <Fragment>
      <SubHeader title="Profile Information" />
      <ProfileForm updateProfile={updateProfile} />
    </Fragment>
  );
};

export default Controller;
