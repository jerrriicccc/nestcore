import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Card, Form, Alert, Spinner } from "react-bootstrap";
import { TextInput, PasswordInput, PhoneNumberInput, DateInput } from "../../components/form/Input";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const fieldLabels = {
  email: "Email",
  password: "Password",
  phonenumber: "Phone Number",
  birthdate: "Birthdate",
};

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phonenumber: "",
    birthdate: "",
    defaultroleid: 2,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setFormError("");
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const fields = Object.keys(fieldLabels) as Array<keyof typeof fieldLabels>;

    fields.forEach((field) => {
      if (!formData[field] || formData[field] === "") {
        newErrors[field] = `${fieldLabels[field]} Required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      setErrors({ ...errors, email: newErrors.email });
      return false;
    } else if (!phoneRegex.test(formData.phonenumber)) {
      newErrors.phonenumber = "Please enter a valid phone number";
      setErrors({ ...errors, phonenumber: newErrors.phonenumber });
      return false;
    } else if (!dateRegex.test(formData.birthdate)) {
      newErrors.birthdate = "Please enter a valid date";
      setErrors({ ...errors, birthdate: newErrors.birthdate });
      return false;
    } else {
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setFormError("");

    try {
      const requestData = {
        email: formData.email.trim(),
        password: formData.password,
        phonenumber: formData.phonenumber.trim(),
        birthdate: formData.birthdate || null,
        defaultroleid: 2,
      };

      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (Array.isArray(data.message) ? data.message.join(", ") : "Signup failed"));
      }

      alert("Signup successful! Please check your email for verification.");
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      setFormError(err instanceof Error ? err.message : "Failed to register. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <Card style={{ width: "100%", maxWidth: "400px", padding: "20px" }}>
        <Card.Body>
          <h2 className="text-center mb-4">Sign Up</h2>

          {formError && (
            <Alert variant="danger" className="mb-3">
              {formError}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <TextInput name="email" label={fieldLabels.email} data={formData.email} onChange={handleChange} placeholder="Enter your email" error={errors.email} />
            <PasswordInput name="password" label={fieldLabels.password} data={formData.password} onChange={handleChange} placeholder="Enter your password" error={errors.password} />
            <PhoneNumberInput name="phonenumber" label={fieldLabels.phonenumber} data={formData.phonenumber} onChange={handleChange} error={errors.phonenumber} />
            <DateInput name="birthdate" label={fieldLabels.birthdate} data={formData.birthdate} onChange={handleChange} error={errors.birthdate} />

            <Button style={{ backgroundColor: "#014c77" }} type="submit" className="w-100 mt-3" disabled={loading}>
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Please wait...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>

            <p className="text-center mt-3">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Signup;
