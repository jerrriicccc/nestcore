import { lazy } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import SuspenseExt from "./components/suspense/SuspenseExt";
import ProtectedRoute from "./pages/authentication/ProtectedRoute";
import Layout from "./components/layout/Layout";
import ProfileForm from "./pages/profile/ProfileForm";
import { AuthProvider } from "./context/AuthContext";
import { TitleProvider } from "./context/TitleContext";
import LandingPage from "./pages/landingpage/Controller";
import NotFound from "./pages/NotFound";

// Login
const Login = lazy(() => import("./pages/authentication/Login"));
const GitHubCallback = lazy(() => import("./pages/authentication/GitHubCallback"));
const Dashboard = lazy(() => import("./pages/dashboard/Controller"));
const SessionExpired = lazy(() => import("./pages/SessionExpired"));

// Email Verification
const VerifySuccess = lazy(() => import("./pages/mailverification/VerifySuccess"));
const VerifyFailed = lazy(() => import("./pages/mailverification/VerifyFailed"));
const ResetPassword = lazy(() => import("./pages/authentication/ResetPassword"));

// Users
const UserList = lazy(() => import("./pages/userlist/Controller"));
const UserCard = lazy(() => import("./pages/usercard/Controller"));
const Profile = lazy(() => import("./pages/profile/Controller"));

// Appointment
const Appointment = lazy(() => import("./pages/appointmentlist/Controller"));
const AppointmentCard = lazy(() => import("./pages/appointmentcard/Controller"));
const ServiceSettingHome = lazy(() => import("./pages/servicesettinghome/Controller"));
const AppointmentStatusCard = lazy(() => import("./pages/appointmentstatus/Controller"));
const AppointmentWorkflowSettCard = lazy(() => import("./pages/appointmentworkflowsetting/Controller"));
const AppointmentNumberCard = lazy(() => import("./pages/appointmentnumber/Controller"));
const AppintmentSettingCard = lazy(() => import("./pages/appointmentsetting/Controller"));

// Role
const RoleList = lazy(() => import("./pages/rolelist/Controller"));
const RoleCard = lazy(() => import("./pages/rolecard/Controller"));
const RoleAccessList = lazy(() => import("./pages/roleaccesslist/Controller"));
const RoleAccessCard = lazy(() => import("./pages/roleaccesscard/Controller"));
const SwitchRole = lazy(() => import("./pages/switchrole/Controller"));

// Router config
const router = createBrowserRouter([
  // ROUTE WITHOUT LAYOUT
  {
    path: "/",
    element: (
      <AuthProvider>
        <TitleProvider>
          <SuspenseExt body={<LandingPage />} />
        </TitleProvider>
      </AuthProvider>
    ),
  },

  // ROUTE WITH LAYOUT AND PROTECTED ROUTES
  {
    path: "",
    element: (
      <AuthProvider>
        <TitleProvider>
          <Layout>
            <Outlet />
          </Layout>
        </TitleProvider>
      </AuthProvider>
    ),
    // errorElement: "Page does not exist",
    children: [
      {
        path: "*",
        element: <NotFound />,
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<Dashboard />} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/userlist",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<UserList />} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/user/:mode",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<UserCard />} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<Profile />} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile/:mode",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<ProfileForm />} />
          </ProtectedRoute>
        ),
      },

      {
        path: "/appointmentlist",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<Appointment />} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/appointment/:mode",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<AppointmentCard />} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/rolelist",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<RoleList />} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/role/:mode",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<RoleCard />} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/roleaccesslist",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<RoleAccessList />} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/roleaccessdetails/:mode",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<RoleAccessCard />} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/servicesettinghome",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<ServiceSettingHome />} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/appointmentstatus/:mode",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<AppointmentStatusCard />} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/appointmentworkflowsetting/:mode",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<AppointmentWorkflowSettCard />} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/appointmentnumber/:mode",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<AppointmentNumberCard />} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/appointmentsettings/:mode",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<AppintmentSettingCard />} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/switchrole/:mode",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<SwitchRole />} />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // AUTH AND PUBLIC ROUTES
  {
    path: "/reset-password",
    element: (
      <AuthProvider>
        <SuspenseExt body={<ResetPassword />} />
      </AuthProvider>
    ),
  },
  {
    path: "/auth/verify-success",
    element: (
      <AuthProvider>
        <SuspenseExt body={<VerifySuccess />} />
      </AuthProvider>
    ),
  },
  {
    path: "/auth/verify-failed",
    element: (
      <AuthProvider>
        <SuspenseExt body={<VerifyFailed />} />
      </AuthProvider>
    ),
  },
  {
    path: "/auth",
    element: (
      <AuthProvider>
        <SuspenseExt body={<GitHubCallback />} />
      </AuthProvider>
    ),
  },
  {
    path: "/session-expired",
    element: (
      <AuthProvider>
        <SuspenseExt body={<SessionExpired />} />
      </AuthProvider>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
