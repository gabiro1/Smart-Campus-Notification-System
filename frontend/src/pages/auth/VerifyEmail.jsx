import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

import Navbar from "../../layouts/Navbar";
import Footer from "../../layouts/Footer";
import apiClient from "../../services/apiClient";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await apiClient.get(`/users/verify-email/${token}`);
        setStatus("success");
        setMessage(res.data?.message || "Your email has been verified!");
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Verification failed. Link may have expired."
        );
      }
    };

    if (token) {
      verify();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-card text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          {status === "verifying" && (
            <div className="space-y-4">
              <Loader2 className="mx-auto animate-spin text-blue-400" size={48} />
              <h1 className="text-2xl font-bold">Verifying Email...</h1>
              <p className="text-muted-foreground">Please wait while we confirm your email address.</p>
            </div>
          )}

          {status === "success" && (
            <div className="bg-green-900/20 border border-green-800/30 rounded-2xl p-8">
              <CheckCircle className="mx-auto mb-4 text-green-400" size={48} />
              <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <Link
                to="/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Continue to Login
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-900/20 border border-red-800/30 rounded-2xl p-8">
              <XCircle className="mx-auto mb-4 text-red-400" size={48} />
              <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <Link
                to="/login"
                className="inline-block bg-accent hover:bg-accent/80 px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Back to Login
              </Link>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
