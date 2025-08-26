import { Row, Col, Button, Image } from "react-bootstrap";
import Logo from "../../assets/images/logo.jpg";

const LandingPage = () => {
  return (
    <div className="text-center d-flex flex-column justify-content-center align-items-center px-3" style={{ minHeight: "100vh", backgroundColor: "#edeff0" }}>
      {/* Logo */}
      <Image src={Logo} alt="Paws & Pals Logo" roundedCircle width={180} height={180} className="shadow mb-4" style={{ objectFit: "cover" }} />

      {/* Heading */}
      <h1 className="display-5 fw-semibold mb-3">Welcome to Paws & Pals 🐾</h1>

      {/* Subtext */}
      <p className="lead text-muted mb-3" style={{ maxWidth: "700px" }}>
        Where wagging tails meet gentle care. We offer expert grooming, loving daycare, essential supplies, and personalized wellness services—because your pet deserves the best.
      </p>

      {/* Buttons */}
      <Row className="justify-content-center g-3 mb-5 w-100">
        <Col xs="auto">
          <Button variant="primary" size="sm" href="/services">
            Care Services
          </Button>
        </Col>
        <Col xs="auto">
          <Button variant="primary" size="sm">
            Book Now
          </Button>
        </Col>
      </Row>

      {/* Footer */}
      <footer className="text-muted small">📍 UGF 13 Versailles Town Plaza, Las Piñas &nbsp;|&nbsp; 📞 0995 387 6946 &nbsp;|&nbsp; 📧 pawsandpalspetcareservices@gmail.com</footer>
    </div>
  );
};

export default LandingPage;
