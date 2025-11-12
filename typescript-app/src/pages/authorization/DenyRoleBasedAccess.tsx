import Alert from "react-bootstrap/Alert";

interface DenyRoleBasedAccessProps {
  authorization?: {
    message?: string;
  };
}

const DenyRoleBasedAccess = (props: DenyRoleBasedAccessProps) => {
  const { authorization = { message: "You have no access to this resource." } } = props;
  return (
    <Alert variant="warning" className="text-center justify-center mx-4 ">
      <Alert.Heading>Role-Based Access Control</Alert.Heading>
      <p>{authorization.message}</p>
    </Alert>
  );
};

export default DenyRoleBasedAccess;
