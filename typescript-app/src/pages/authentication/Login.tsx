import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Form, Alert, Spinner } from "react-bootstrap";
import { TextInput, PasswordInput, PhoneNumberInput, DateInput } from "../../components/form/Input";
import { setToken, isAuthenticated, getToken } from "../../lib/token-service";
import { APIURL } from "../../lib/constants";
import { useAuth } from "../../context/AuthContext";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const fieldLabels = {
  email: "Email",
  password: "Password",
  phonenumber: "Phone Number",
  birthdate: "Birth Date",
};

interface LoginSuccessResponse {
  status: "success";
  data: {
    access_token: string;
    rbac_tokens: { [key: string]: string };
    user: {
      id: number;
      email: string;
      defaultroleid: number;
    };
  };
}

interface SignupSuccessResponse {
  status: "success";
  message?: string;
}

interface ErrorResponse {
  message: string | string[];
  status?: "error";
  statusCode?: number;
}

type ApiResponse = LoginSuccessResponse | SignupSuccessResponse | ErrorResponse;

const Login = () => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phonenumber: "",
    birthdate: "",
    defaultroleid: 2,
  });

  useEffect(() => {
    // Check if user is already authenticated using the new token service
    if (isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (formSuccess) {
      const timer = setTimeout(() => {
        setFormSuccess(null);
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [formSuccess]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    let fieldsToValidate: Array<keyof typeof fieldLabels>;

    if (isLogin) {
      fieldsToValidate = ["email", "password"];
    } else {
      fieldsToValidate = ["email", "password", "phonenumber", "birthdate"];
    }

    fieldsToValidate.forEach((field) => {
      if (!formData[field] || String(formData[field]).trim() === "") {
        newErrors[field] = `${fieldLabels[field]} Required`;
      }
    });

    if (!newErrors.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!isLogin && !newErrors.phonenumber && !phoneRegex.test(formData.phonenumber)) {
      newErrors.phonenumber = "Please enter a valid phone number (e.g., 10 digits)";
    }
    if (!isLogin && !newErrors.birthdate && !dateRegex.test(formData.birthdate)) {
      newErrors.birthdate = "Please enter a valid date (YYYY-MM-DD)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    setLoading(true);

    const isValid = validateForm();
    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      let response: Response;
      let data: ApiResponse;

      if (isLogin) {
        // LOGIN LOGIC
        response = await fetch(`${APIURL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
          }),
        });

        data = (await response.json()) as ApiResponse;

        if (!response.ok) {
          const errorData = data as ErrorResponse;
          const errorMessage = typeof errorData.message === "string" ? errorData.message : Array.isArray(errorData.message) ? errorData.message.join(", ") : "Login failed";
          throw new Error(errorMessage);
        }

        // Check if response has the expected structure
        if ((data as LoginSuccessResponse).status === "success" && (data as LoginSuccessResponse).data?.access_token) {
          const loginData = data as LoginSuccessResponse;

          // Use the updated token service with RBAC tokens
          setToken(loginData.data.access_token, loginData.data.rbac_tokens);

          // Update auth context (user data will be extracted from token)
          await checkAuthStatus();

          navigate("/dashboard", { replace: true });
        } else {
          setFormError("Invalid response from server");
        }
      } else {
        // SIGNUP LOGIC
        const requestData = {
          email: formData.email.trim(),
          password: formData.password,
          phonenumber: formData.phonenumber.trim(),
          birthdate: formData.birthdate || null,
          defaultroleid: formData.defaultroleid,
        };

        response = await fetch(`${APIURL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestData),
        });

        data = (await response.json()) as ApiResponse;

        if (!response.ok) {
          const errorData = data as ErrorResponse;
          const errorMessage = typeof errorData.message === "string" ? errorData.message : Array.isArray(errorData.message) ? errorData.message.join(", ") : "Signup failed";
          throw new Error(errorMessage);
        }

        setFormSuccess("Signup successful! Please check your email for verification.");
        setIsLogin(true);
        setFormData({ ...formData, password: "" });
      }
    } catch (err: any) {
      console.error(`${isLogin ? "Login" : "Sign Up"} error:`, err);

      const errorMessage = err.message || "";

      if (isLogin) {
        if (errorMessage.includes("verify")) {
          setFormError("Please verify your email before logging in.");
        } else if (errorMessage.includes("locked")) {
          setFormError("Account is locked. Reset your password.");
        } else if (errorMessage.includes("exist") || errorMessage.includes("find")) {
          setFormError("Couldn't find your account. Please sign up.");
        } else if (errorMessage.includes("Invalid")) {
          setFormError("Invalid credentials. Please try again.");
        } else if (errorMessage.includes("No token provided")) {
          setFormError("Authentication error. Please try again.");
        } else {
          setFormError("Cannot connect to the server. Please try again later.");
        }
      } else {
        if (errorMessage.includes("already exists")) {
          setFormError("An account with this email already exists. Please log in.");
        } else {
          setFormError("Sign up failed. Please try again later.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginViaIS = async () => {
    try {
      // If user is already logged in, this is an account linking flow
      if (isAuthenticated()) {
        // The backend /auth/github endpoint is protected by AuthGuard('jwt')
        // It will automatically pick up the user's token from the Authorization header
        window.location.assign(`${APIURL}/auth/github`);
        return;
      }

      // First check if GitHub OAuth is configured
      const token = getToken();
      const configRes = await fetch(`${APIURL}/auth/github/config`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!configRes.ok) {
        setFormError("GitHub OAuth is not available. Please use regular login.");
        return;
      }

      const config = await configRes.json();

      if (!config.hasClientId || !config.hasClientSecret) {
        setFormError("GitHub OAuth is not configured. Please use regular login.");
        return;
      }

      // If GitHub OAuth is configured, try to get the login URL
      const res = await fetch(`${APIURL}/auth/github/login`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        setFormError("Failed to initiate GitHub login.");
        return;
      }

      const data = await res.json();

      // Check if the response indicates an error
      if (data.status === "error") {
        setFormError(data.message || "GitHub OAuth is not available. Please use regular login.");
        return;
      }

      const url = data?.data?.access_uri || data?.data?.redirect_url || data?.access_uri || data?.redirect_url;

      if (url) {
        window.location.assign(url);
      } else {
        setFormError("Authorization URL not provided by server.");
      }
    } catch (err: any) {
      setFormError("GitHub OAuth is not available. Please use regular login.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <Card style={{ width: "100%", maxWidth: "400px", padding: "20px" }}>
        <Card.Body>
          <h2 className="text-center mb-4">{isLogin ? "Account Login" : "Sign Up"}</h2>
          {formError && (
            <Alert variant="danger" className="mb-3">
              {formError}
            </Alert>
          )}

          {formSuccess && (
            <Alert variant="success" className="mb-3">
              {formSuccess}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <TextInput name="email" label={fieldLabels.email} data={formData.email} onChange={handleChange} placeholder="Enter your email" error={errors.email} />
            <PasswordInput name="password" label={fieldLabels.password} data={formData.password} onChange={handleChange} placeholder="Enter your password" error={errors.password} />

            {!isLogin && (
              <>
                <PhoneNumberInput name="phonenumber" label={fieldLabels.phonenumber} data={formData.phonenumber} onChange={handleChange} error={errors.phonenumber} />
                <DateInput name="birthdate" label={fieldLabels.birthdate} data={formData.birthdate} onChange={handleChange} error={errors.birthdate} />
              </>
            )}

            <Button style={{ backgroundColor: "#014c77" }} type="submit" className="w-100 mt-3" disabled={loading}>
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  {isLogin ? "Logging in..." : "Please wait..."}
                </>
              ) : isLogin ? (
                "Login"
              ) : (
                "Sign Up"
              )}
            </Button>

            {isLogin && (
              <Button variant="outline-secondary" type="button" className="w-100 mt-2" onClick={handleLoginViaIS} disabled={loading}>
                {isAuthenticated() ? "Connect GitHub Account" : "Sign in with Github"}
              </Button>
            )}

            <div className="d-flex justify-content-center mt-3">
              {isLogin ? (
                <button type="button" onClick={() => setIsLogin(false)} className="btn btn-link text-decoration-none">
                  Don't have an account? Sign up
                </button>
              ) : (
                <button type="button" onClick={() => setIsLogin(true)} className="btn btn-link text-decoration-none">
                  Already have an account? Login here
                </button>
              )}
            </div>
            {isLogin && (
              <div className="d-flex justify-content-center mt-1">
                <a href="/reset-password" className="text-decoration-none">
                  Forgot password?
                </a>
              </div>
            )}
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
