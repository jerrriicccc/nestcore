import { Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

const linkList = [
  { link: "/groomservice/create", label: "Groom Services" },
  { link: "/daycareservice/create", label: "Daycare Services" },
  { link: "/timeschedule/create", label: "Time Schedule" },
  { link: "/additionalservice/create", label: "Additional Services" },
];

const linkList1 = [
  { link: "/workflowsettings/create", label: "Worklflow Settings" },
  { link: "/appointmentsettings/create", label: "Appointment Settings" },
  { link: "/appointmentnumber/create", label: "Appointment Number" },
];

const Links = () => {
  return (
    <div className="px-4 ">
      <h2 className="mb-2 fw-bold" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        Service
      </h2>
      <Row className="g-3 mb-3">
        {linkList.map(({ link, label }, index) => (
          <Col key={index} sm={6} md={4} lg={3} className="d-grid">
            <Link to={link} className="btn btn-primary fs-5 px-3 py-3">
              {label}
            </Link>
          </Col>
        ))}
      </Row>

      <h2 className="mb-2 fw-bold" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
        Module
      </h2>
      <Row>
        {linkList1.map(({ link, label }, index) => (
          <Col key={index} sm={6} md={4} lg={3} className="d-grid">
            <Link to={link} className="btn btn-primary fs-5 px-3 py-3">
              {label}
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Links;
