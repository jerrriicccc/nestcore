import { useNavigate } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";

const VerifySuccess = () => {
  const navigate = useNavigate();

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="text-center shadow-lg p-4" style={{ width: "50%" }}>
        <Card.Body>
          <Card.Title className="fs-4 fw-bold text-black" style={{ fontFamily: "'Lora', serif" }}>
            Email Verified!
          </Card.Title>
          <Card.Text className="text-muted">You can now log in.</Card.Text>
          <Button variant="secondary" className="fw-bold w-100" onClick={() => navigate("/")}>
            Login
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default VerifySuccess;
