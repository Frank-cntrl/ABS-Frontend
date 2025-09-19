import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./AppStyles.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { API_URL, SOCKETS_URL, NODE_ENV } from "./shared";
import { io } from "socket.io-client";

//Components
import NavBar from "./components/NavBar";
import Login from "./components/Login";
import Home from "./components/Home";
import NotFound from "./components/NotFound";
import UserPage from "./components/UserPage";
import Eboard from "./components/Eboard";
import Events from "./components/Events";
import FullEventPage from "./components/FullEventPage";

const socket = io(SOCKETS_URL, {
  withCredentials: NODE_ENV === "production",
});

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("🔗 Connected to socket");
    });
  }, []);

  // Check authentication on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        setUser(null);
        setLoading(false);
        return;
      }

      console.log("Checking token validity...");
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      console.log("Token valid, user:", response.data.user);
      setUser(response.data.user);
    } catch (error) {
      console.log("Token invalid or expired, removing...");
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log("Logging out...");

    try {
      const token = localStorage.getItem("token");

      // Clear local state first
      localStorage.removeItem("token");
      setUser(null);

      // Logout from backend if we had a token
      if (token) {
        await axios.post(
          `${API_URL}/auth/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
      }
    } catch (error) {
      console.error("Backend logout error:", error);
    } finally {
      navigate("/");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <NavBar user={user} onLogout={handleLogout} />
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/" element={<Home />} />
          <Route path="/me" element={<UserPage user={user} />} />
          <Route path="/events" element={<Events user={user} />} />
          <Route path="/events/:id" element={<FullEventPage />} />
          <Route path="/eboard" element={<Eboard user={user} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

const Root = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<Root />);
