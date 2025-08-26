import { useNavigate } from "react-router-dom";
import { Container, Card, Button, Alert } from "react-bootstrap";
import { useEffect } from "react";
import { clearToken } from "../lib/token-service";

const SessionExpired = () => {
  const navigate = useNavigate();

  useEffect(() => {
    clearToken();
  }, []);

  const handleLogin = () => {
    navigate("/");
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="text-center shadow-lg p-4" style={{ width: "50%" }}>
        <Card.Body>
          <Card.Title className="fs-4 fw-bold text-black" style={{ fontFamily: "'Lora', serif" }}>
            Session Expired
          </Card.Title>
          <Alert variant="warning" className="mt-3">
            Your session has expired due to inactivity or timeout. Please log in again to continue.
          </Alert>
          <Button variant="primary" className="fw-bold w-100 mt-3" onClick={handleLogin}>
            Return to Login
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SessionExpired;
