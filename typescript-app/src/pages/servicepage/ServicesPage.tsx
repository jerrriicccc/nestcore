import React from "react";
import { Container, Row, Col, Card, Table, Image, Badge, Button } from "react-bootstrap";
import Logo from "../../assets/images/logo.jpg";
import { Link } from "react-router-dom";

interface ServicePageProps {
  groomData: {
    size?: string;
    weight?: string;
    type?: string;
    price?: number | string;
  }[];
  dayCareData: {
    size?: string;
    threehrs?: number;
    sixhrs?: number;
    ninehrs?: number;
  }[];
  addSerData: {
    additionalservice?: string;
    price?: string;
  }[];
}
const ServicesPage: React.FC<ServicePageProps> = ({ groomData, dayCareData, addSerData }) => {
  const groomingData = groomData.filter((data) => data);
  const dayCaredata = dayCareData.filter((data) => data);
  const addServiceData = addSerData.filter((data) => data);

  return (
    <Container className="py-2">
      <Row className="align-items-center justify-content-center mb-3 text-center text-md-start">
        <Col xs={12} md={4} className="mb-4 mb-md-0 d-flex justify-content-center">
          <Link to="/dashboard">
            <Image src={Logo} alt="Paws & Pals Logo" roundedCircle width={150} height={150} className="shadow" style={{ objectFit: "cover" }} />
          </Link>
        </Col>
        <Col xs={12} md={6}>
          <h1 className="display-6 fw-bold mb-2" style={{ fontFamily: "Times New Roman, serif" }}>
            PAWS & PALS Services
          </h1>
          <p className="lead text-muted mb-0">Premium grooming, loving daycare, essential supplies, and wellness for your furry friends.</p>
          <Button variant="primary" className="mt-3 me-2" href="appointments">
            Book Now!
          </Button>
        </Col>
      </Row>

      <Row className="g-4 mb-3">
        <Col md={7}>
          <Card className="shadow-sm ">
            <Card.Body>
              <Card.Title as="h2" className="h5 fw-bold mb-3 text-primary">
                Grooming Services & Prices
              </Card.Title>
              <Table striped bordered hover responsive size="sm" className="mb-3">
                <thead className="table-primary">
                  <tr>
                    <th>Size</th>
                    <th>Weight</th>
                    <th>Type</th>
                    <th>Price (₱)</th>
                  </tr>
                </thead>
                <tbody>
                  {groomingData.map((data, idx) => (
                    <tr key={idx}>
                      <td>{data.size}</td>
                      <td>{data.weight}</td>
                      <td>{data.type}</td>
                      <td>{data.price}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="mb-2">
                <Badge bg="info" className="me-2">
                  Premium Groom Includes:
                </Badge>
                <span className="text-muted small">
                  Bathing (Shampoo, Blow Dry, Brushing, Powder & Cologne), Nail Clipping, Ear Cleaning, Teeth Brushing, Anal Sac Removal, Shaving of paw pads, anal fur, underbelly (if applicable)
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={5}>
          <Card className="shadow-sm ">
            <Card.Body>
              <Card.Title as="h2" className="h5 fw-bold mb-3 text-success">
                Additional Grooming Services
              </Card.Title>
              <Table bordered size="sm" className="mb-3">
                <tbody>
                  {addServiceData.map((data, idx) => (
                    <tr key={idx}>
                      <td>{data.additionalservice}</td>
                      <td className="text-end">₱ {data.price}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="mb-2">
                <Badge bg="secondary" className="me-2">
                  Other Services
                </Badge>
                <ul className="mb-0 small text-muted ps-3">
                  <li>
                    <b>Pet Products & Supplies </b>(Dog food & treats, diapers, shampoo, leash, collar, etc.)
                  </li>
                  <li>
                    <b>Pet Wellness </b>(Vaccinations, Deworming, Tick & Fleas) <span className="fst-italic">by appointment only</span>
                  </li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title as="h2" className="h5 fw-bold mb-3 text-warning">
                Daycare Services & Prices
              </Card.Title>
              <Table striped bordered hover responsive size="sm">
                <thead className="table-warning">
                  <tr>
                    <th>Size</th>
                    <th>3 hrs</th>
                    <th>6 hrs</th>
                    <th>9 hrs</th>
                  </tr>
                </thead>
                <tbody>
                  {dayCaredata.map((data, idx) => (
                    <tr key={idx}>
                      <td>{data.size}</td>
                      <td>{data.threehrs}</td>
                      <td>{data.sixhrs}</td>
                      <td>{data.ninehrs}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="small text-muted mt-2">*Food not included. Food should be provided by the owner or house food can also be arranged.</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={10} className="text-center">
          <footer className="text-muted small mt-4">
            <span className="fw-bold">UGF 13 Versailles Town Plaza, Dang Hari Road, Almanza Dos, City of Las Piñas</span>
            <br />
            <span>📞 0995 387 6946 &nbsp;|&nbsp; 📧 pawsandpalspetcareservices@gmail.com</span>
          </footer>
        </Col>
      </Row>
    </Container>
  );
};

export default ServicesPage;
