import { Fragment, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LandingPage from "./LandingPage";
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
          <Col md={6} className="d-flex align-items-center justify-content-center" style={{ backgroundColor: "#edeff0" }}>
            <LandingPage />
          </Col>
          <Col md={6} className="mb-4">
            <Login />
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Controller;
