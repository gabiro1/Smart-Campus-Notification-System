import { Route } from "react-router-dom";

// Public Pages
import Landing from "../pages/home/landing/pages/Landing";
import Features from "../pages/home/features/Features";
import HowItWorks from "../pages/home/howitworks/HowItWorks";
import About from "../pages/home/About/About";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";
import VerifyOTP from "../features/auth/pages/VerifyOTP";
import GoogleAuth from "../features/auth/pages/GoogleAuth";
import InterestSelection from "../features/auth/pages/InterestSelection";

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
