import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // --- WAKE UP & HYDRATE ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("authToken");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    setIsLoading(false);
  }, []);

  // --- LOGIN ACTION ---
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("authToken", authToken);

    // Strict Role-Based Routing
    if (userData.role === "student") {
      navigate("/student/dashboard");
    } else if (userData.role === "hod") {
      navigate("/hod/dashboard");
    } else if (userData.role === "lecturer") {
      navigate("/lecturer/console");
    } else {
      navigate("/admin/overview");
    }
  };

  // --- UPDATE USER ACTION ---
  // Keeps the UI perfectly synced without forcing a logout
  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem("user", JSON.stringify(newUserData));
  };

  // --- LOGOUT ACTION ---
  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("authToken");

    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, logout, updateUser }}
    >
      {!isLoading ? (
        children
      ) : (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-blue-500 font-bold tracking-widest uppercase text-sm animate-pulse">
          Securing Portal...
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
