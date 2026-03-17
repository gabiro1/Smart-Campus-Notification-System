import { Route } from "react-router-dom";

// Public Pages
import Landing from "../pages/home/landing/pages/Landing";
import Features from "../pages/home/features/Features";
import HowItWorks from "../pages/home/howitworks/HowItWorks";
import About from "../pages/home/about/About";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

export const publicRoutes = [
  <Route key="landing" path="/" element={<Landing />} />,
  <Route key="features" path="/features" element={<Features />} />,
  <Route key="how-it-works" path="/how-it-works" element={<HowItWorks />} />,
  <Route key="about" path="/about" element={<About />} />,
  <Route key="login" path="/login" element={<Login />} />,
  <Route key="register" path="/register" element={<Register />} />,
];
