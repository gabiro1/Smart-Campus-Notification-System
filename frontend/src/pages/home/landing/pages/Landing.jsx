import Hero from "../components/Hero";
import { Partners } from "../components/Partners";
import Features from "../components/Features";
import { Process } from "../components/Process";
import Footer from "../../../../layouts/Footer";
import Navbar from "../../../../layouts/Navbar";

export default function Landing() {
  return (
    <div className="bg-neutral-950">
      <Navbar />
      <Hero />
      {/* <Partners /> */}
      <Features />
      <Process />
      {/* Optional: Add a "Call to Action" section here */}
      <Footer />
    </div>
  );
}
