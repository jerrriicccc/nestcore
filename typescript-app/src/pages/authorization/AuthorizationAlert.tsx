import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, getUserFromToken } from "../../lib/token-service";

const AuthorizationAlert = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthorization = () => {
      const token = getToken();

      if (!token) {
        setIsAuthorized(false);
        setIsLoading(false);
        // navigate("/login");
        return;
      }

      // Get user data from token
      const userData = getUserFromToken();

      if (userData) {
        // Check if user has defaultroleid 1 (admin) - allow access to all routes
        if (userData.defaultroleid === 1) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }
      }

      // For non-admin users, you can add additional role-based checks here
      // For now, we'll allow access to all authenticated users
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuthorization();
  }, [navigate]);

  if (isLoading) {
    return null; // Don't show anything while checking authorization
  }

  if (!isAuthorized) {
    return <p>You are not authorized to view this page.</p>;
  }

  return null; // User is authorized, don't show any message
};

export default AuthorizationAlert;
