import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Spinner } from "react-bootstrap";
import { setToken } from "../../lib/token-service";
import { APIURL } from "../../lib/constants";
import { useAuth } from "../../context/AuthContext";

const GitHubCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    // Prevent duplicate processing
    if (hasProcessed) return;

    const handleCallback = async () => {
      try {
        // Mark as processed to prevent duplicate calls
        setHasProcessed(true);
        // This handles the "Link Account" flow, where the backend sends a JWT directly
        const token = searchParams.get("token");
        if (token) {
          setError("Your GitHub account has been successfully linked! You will be redirected shortly.");
          // In a real app, you might just show a success message and let the user close the window/tab
          // Or, you could re-fetch user data to show the "linked" status.
          setTimeout(() => navigate("/dashboard"), 3000);
          setLoading(false);
          return;
        }

        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");

        // Check for OAuth error
        if (error) {
          setError(`GitHub OAuth error: ${error}`);
          setLoading(false);
          return;
        }

        // Check if we have the authorization code
        if (!code) {
          setError("Authorization code not received from GitHub");
          setLoading(false);
          return;
        }

        // Verify state parameter (optional but recommended for security)
        const storedState = sessionStorage.getItem("github_oauth_state");
        if (state && storedState && state !== storedState) {
          setError("Invalid state parameter - possible CSRF attack");
          setLoading(false);
          return;
        }

        // Exchange code for access token
        const response = await fetch(`${APIURL}/auth/requesttokenis`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            code,
            state: state || undefined,
          }),
        });

        const data = await response.json();

        if (response.ok && data.status === "success" && data.data?.access_token) {
          // Store the access token and other data

          // Use the token service to store tokens with RBAC tokens
          setToken(data.data.access_token, data.data.rbac_tokens || {});

          // Update auth context (user data will be extracted from token)
          await checkAuthStatus();

          // Clean up stored state
          sessionStorage.removeItem("github_oauth_state");

          // Redirect to dashboard
          navigate("/dashboard", { replace: true });
        } else {
          console.error("GitHub OAuth failed:", { response: response.status, data });
          console.error("Full error details:", JSON.stringify(data, null, 2));

          // Handle specific error cases
          if (response.status === 401 && data.error === "User not found") {
            setError(`No account found with this GitHub email (${data.details?.githubEmail}). Please register first or contact your administrator.`);
          } else {
            setError(data.error || data.details?.error || "Failed to exchange code for access token");
          }
        }
      } catch (err: any) {
        console.error("GitHub callback error:", err);
        setError("An error occurred during GitHub authentication");
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, hasProcessed]); // Removed navigate and checkAuthStatus to prevent duplicate calls

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Completing authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {error && (
          <Alert variant="danger">
            {error}
            <div className="mt-3">
              <button className="btn btn-primary" onClick={() => navigate("/")}>
                Return to Login
              </button>
            </div>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default GitHubCallback;
