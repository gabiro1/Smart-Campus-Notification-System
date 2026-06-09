import { lazy } from "react";
import { Route } from "react-router-dom";

const Landing = lazy(() => import("../pages/home/landing/pages/Landing"));
const Features = lazy(() => import("../pages/home/features/Features"));
const HowItWorks = lazy(() => import("../pages/home/howitworks/HowItWorks"));
const About = lazy(() => import("../pages/home/About/About"));
const Login = lazy(() => import("../features/auth/pages/Login"));
const Register = lazy(() => import("../features/auth/pages/Register"));
const ForgotPassword = lazy(() => import("../features/auth/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../features/auth/pages/ResetPassword"));
const VerifyOTP = lazy(() => import("../features/auth/pages/VerifyOTP"));
const GoogleAuth = lazy(() => import("../features/auth/pages/GoogleAuth"));
const InterestSelection = lazy(() => import("../features/auth/pages/InterestSelection"));

export const publicRoutes = [
  <Route key="landing" path="/" element={<Landing />} />,
  <Route key="features" path="/features" element={<Features />} />,
  <Route key="how-it-works" path="/how-it-works" element={<HowItWorks />} />,
  <Route key="about" path="/about" element={<About />} />,
  <Route key="login" path="/login" element={<Login />} />,
  <Route key="register" path="/register" element={<Register />} />,
  <Route key="forgot-password" path="/forgot-password" element={<ForgotPassword />} />,
  <Route key="reset-password" path="/reset-password" element={<ResetPassword />} />,
  <Route key="set-password" path="/set-password" element={<ResetPassword />} />,
  <Route key="verify-otp" path="/verify-otp" element={<VerifyOTP />} />,
  <Route key="google-auth" path="/google-auth" element={<GoogleAuth />} />,
  <Route key="interest-selection" path="/interest-selection" element={<InterestSelection />} />,
];
