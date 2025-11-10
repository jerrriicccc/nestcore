import { Fragment, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../authentication/Login";
import { Row, Col, Container } from "react-bootstrap";
import { isAuthenticated } from "../../lib/token-service";

const Controller = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <Fragment>
      <Container fluid>
        <Row style={{ minHeight: "100vh" }}>
          <Col md={12} className="d-flex align-items-center justify-content-center">
            <Login />
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Controller;
