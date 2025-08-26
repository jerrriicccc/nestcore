// import { readData } from "../../lib/web-crud-api";
import { readData } from "../../lib/crud";
import useHttpCallback from "../../lib/use-httpcallback";
import { useEffect } from "react";
import Loading from "../../components/Loading";

const LoginViaIS = () => {
  const redirectToIS = (responseData: any) => {
    if (responseData.type === "SUCCESS") {
      window.location.replace = responseData.data.redirect_url;
    }
  };

  const { sendRequest: getISLogin } = useHttpCallback(readData, redirectToIS);

  useEffect(() => {
    getISLogin("/auth/loginviais", { passToken: false });
  }, []);

  return (
    <div className="container-fluid">
      <Loading />
    </div>
  );
};

export default LoginViaIS;
