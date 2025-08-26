import { lazy } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import SuspenseExt from "./components/suspense/SuspenseExt";
import ProtectedRoute from "./pages/authentication/ProtectedRoute";
import Layout from "./components/layout/Layout";
import ProfileForm from "./pages/profile/ProfileForm";
import { AuthProvider } from "./context/AuthContext";
import { TitleProvider } from "./context/TitleContext";
import LandingPage from "./pages/landingpage/Controller";
import ServicesPage from "./pages/servicepage/Controller";
import NotFound from "./pages/NotFound";

// Login
const Login = lazy(() => import("./pages/authentication/Login"));
const Dashboard = lazy(() => import("./pages/dashboard/Controller"));
const Signup = lazy(() => import("./pages/authentication/Signup"));
const SessionExpired = lazy(() => import("./pages/SessionExpired"));

// Mail Verification
const VerifySuccess = lazy(() => import("./pages/mailverification/VerifySuccess"));
const VerifyFailed = lazy(() => import("./pages/mailverification/VerifyFailed"));
const ResetPassword = lazy(() => import("./pages/authentication/ResetPassword"));

// Users
const UserList = lazy(() => import("./pages/userlist/Controller"));
const UserCard = lazy(() => import("./pages/usercard/Controller"));
const Profile = lazy(() => import("./pages/profile/Controller"));

// Appointment
const Appointment = lazy(() => import("./pages/appointment/Controller"));
const AppointmentCard = lazy(() => import("./pages/appointmentcard/Controller"));

// Role
const RoleList = lazy(() => import("./pages/rolelist/Controller"));
const RoleCard = lazy(() => import("./pages/rolecard/Controller"));
const RoleAccessList = lazy(() => import("./pages/roleaccesslist/Controller"));
const RoleAccessCard = lazy(() => import("./pages/roleaccesscard/Controller"));

// Services
const GroomService = lazy(() => import("./pages/groomservice/Controller"));
const DaycareService = lazy(() => import("./pages/daycareservice/Controller"));
const ServiceSettingHome = lazy(() => import("./pages/servicesettinghome/Controller"));
const AdditionalService = lazy(() => import("./pages/additionalservice/Controller"));
const TimeSched = lazy(() => import("./pages/timeschedule/Controller"));
const StatusCard = lazy(() => import("./pages/statuses/Controller"));
const WorkflowSettCard = lazy(() => import("./pages/workflowsettings/Controller"));

// Appointment Number
const AppointmentNumber = lazy(() => import("./pages/appointmentnumber/Controller"));

// Module
const ModuleCard = lazy(() => import("./pages/appointmentsettings/Controller"));

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
    errorElement: "Page does not exist",
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
        path: "/appointments",
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
        path: "/groomservice/:mode",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<GroomService />} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/daycareservice/:mode",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<DaycareService />} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/additionalservice/:mode",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<AdditionalService />} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/timeschedule/:mode",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<TimeSched />} />
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
        path: "/statuses/:mode",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<StatusCard />} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/workflowsettings/:mode",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<WorkflowSettCard />} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/appointmentnumber/:mode",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<AppointmentNumber />} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/appointmentsettings/:mode",
        element: (
          <ProtectedRoute>
            <SuspenseExt body={<ModuleCard />} />
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
    path: "/session-expired",
    element: (
      <AuthProvider>
        <SuspenseExt body={<SessionExpired />} />
      </AuthProvider>
    ),
  },
  {
    path: "/services",
    element: (
      <AuthProvider>
        <SuspenseExt body={<ServicesPage />} />
      </AuthProvider>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
