import { Fragment, useEffect, useState } from "react";
import DenyRoleBasedAccess from "./DenyRoleBasedAccess";

interface AuthorizationAlertProps {
  status?: any;
  // If empty or not provided, treat as "all actions"
  dependsOn?: string[];
}

const AuthorizationAlert = (props: AuthorizationAlertProps) => {
  const { status = {}, dependsOn = [] } = props;
  const [alert, setAlert] = useState<{ code: number; message: string } | null>(null);

  useEffect(() => {
    // Normalize response body and extract status/code/message in common shapes
    const resp = status?.body?.response || status?.body || {};
    const code = resp?.status || resp?.code || null;
    const message = resp?.message || resp?.data || "You have no access to this resource.";

    // If dependsOn is empty, treat it as all actions allowed
    const actionAllowed = dependsOn.length === 0 || (status?.action && dependsOn.includes(status.action));

    // Consider both 401 and 403 as access-denied indicators. Also allow message-based detection.
    const isAccessDenied = code === 401 || 403 || (typeof message === "string" && message.toLowerCase().includes("no access"));

    if (status?.status === "error" && status?.action !== "validation" && isAccessDenied && actionAllowed) {
      setAlert({ code: code || 401 || 403, message: typeof message === "string" ? message : "Access denied" });
    } else {
      setAlert(null);
    }
  }, [status, dependsOn]);

  return <Fragment>{alert ? <DenyRoleBasedAccess authorization={alert} /> : null}</Fragment>;
};

export default AuthorizationAlert;
