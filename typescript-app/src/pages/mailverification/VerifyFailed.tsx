import { useNavigate } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";

const VerifyFailed = () => {
  const navigate = useNavigate();

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="text-center shadow-lg p-4" style={{ width: "50%" }}>
        <Card.Body>
          <Card.Title className="fs-4 fw-bold text-black" style={{ fontFamily: "'Lora', serif" }}>
            Verification Failed
          </Card.Title>
          <Card.Text className="text-muted">Invalid or expired token.</Card.Text>
          <Button variant="danger" className="fw-bold w-100" onClick={() => navigate("/")}>
            Go Home
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default VerifyFailed;
