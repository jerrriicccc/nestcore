import { Card, Row, Col, Form, Button } from "react-bootstrap";
import { Fragment, useEffect, useRef, useState } from "react";
import Profile from "../../assets/images/profile.png";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { readData } from "../../lib/crud";

interface ProfileFormProps {
  updateProfile?: () => void;
}

const ProfileForm = ({ updateProfile = () => {} }: ProfileFormProps) => {
  const [previewImage, setPreviewImage] = useState(Profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getData = async () => {
    const data = await readData("users");
    console.log(data);
  };

  useEffect(() => {
    getData();
  }, []);

  const handleEditImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      console.log("Selected image:", file);
      // You can also upload the file to the server here
    }
  };

  return (
    <Fragment>
      <div className="px-5">
        <Card className="p-4 shadow-sm">
          <Row>
            {/* Profile Summary */}
            <Col md={4} className="text-center border-end">
              <div style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={previewImage}
                  alt="Profile"
                  className="rounded-circle mb-3"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    border: "2px solid #ccc",
                  }}
                />

                {/* Overlay Button */}
                <Button
                  title="Change Profile Picture"
                  variant="light"
                  size="sm"
                  onClick={handleEditImageClick}
                  style={{
                    position: "absolute",
                    bottom: "5px",
                    right: "5px",
                    borderRadius: "50%",
                    padding: "6px",
                    boxShadow: "0 0 4px rgba(0,0,0,0.3)",
                    minWidth: "auto",
                  }}
                >
                  <CameraAltIcon fontSize="small" />
                </Button>

                {/* Hidden File Input */}
                <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleImageChange} />
              </div>

              <h5>Alexa Rawles</h5>
            </Col>

            {/* Form Section */}
            <Col md={8}>
              <div className="d-flex justify-content-end mb-3">
                <Button
                  style={{
                    backgroundColor: "#014c77",
                    color: "white",
                    border: "none",
                  }}
                  onClick={updateProfile}
                >
                  Edit
                </Button>
              </div>

              <Form>
                <Row className="mb-3">
                  <Col>
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control placeholder="Your First Name" />
                  </Col>
                  <Col>
                    <Form.Label>Nick Name</Form.Label>
                    <Form.Control placeholder="Your Nickname" />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col>
                    <Form.Label>Gender</Form.Label>
                    <Form.Select>
                      <option>Select Gender</option>
                    </Form.Select>
                  </Col>
                  <Col>
                    <Form.Label>Country</Form.Label>
                    <Form.Select>
                      <option>Select Country</option>
                    </Form.Select>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col>
                    <Form.Label>Language</Form.Label>
                    <Form.Select>
                      <option>Select Language</option>
                    </Form.Select>
                  </Col>
                  <Col>
                    <Form.Label>Time Zone</Form.Label>
                    <Form.Select>
                      <option>Select Time Zone</option>
                    </Form.Select>
                  </Col>
                </Row>

                {/* Email Section */}
                <hr />
                <h5>My Email Address</h5>
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "36px",
                      height: "36px",
                      marginRight: "10px",
                    }}
                  >
                    <EmailOutlinedIcon />
                  </div>
                  <div>
                    <div>alexarawles@gmail.com</div>
                  </div>
                </div>
              </Form>
            </Col>
          </Row>
        </Card>
      </div>
    </Fragment>
  );
};

export default ProfileForm;
