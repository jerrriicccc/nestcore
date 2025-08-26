import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Verify = () => {
  const { token } = useParams();
  const [status, setStatus] = useState<"loading" | "verified" | "error">("loading");

  useEffect(() => {
    axios
      .get(`http://localhost:3000/auth/verify/${token}`)
      .then((response) => {
        if (response.data.redirectUrl) {
          window.location.href = response.data.redirectUrl;
        } else {
          setStatus("verified");
        }
      })
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div>
      {status === "loading" && <p>Verifying...</p>}
      {status === "error" && <p>Verification Failed</p>}
    </div>
  );
};

export default Verify;
