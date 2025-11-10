import React from "react";
import { Container, Row, Col, Card, Table, Badge } from "react-bootstrap";

// interface Appointment {
//   timeName: string;
//   petname: string;
//   date: string;
//   servicetype: string;
// }

// interface DashboardProps {
//   appointments: Appointment[];
// }

const Dashboard = () => {
  // const totalAppointment = appointments.length;

  return (
    <Container fluid className="">
      {/* <Row className="mb-0">
        {[{ title: "Today’s Appointments", value: totalAppointment }].map((item, index) => (
          <Col xs={12} sm={6} md={3} className="mb-0" key={index}>
            <Card style={{ backgroundColor: "#E2C698", height: "auto", fontFamily: "Times New Roman, serif" }} text="dark">
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div className="fw-bold h5 mb-0">{item.title}</div>
                <Badge className="bg-secondary fw-bold fs-6 d-flex justify-content-center align-items-center" style={{ width: "25px", height: "25px", borderRadius: "50%" }}>
                  {item.value}
                </Badge>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row> */}
    </Container>
  );
};

export default Dashboard;
