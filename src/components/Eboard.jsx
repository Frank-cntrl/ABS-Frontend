import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../shared";
import EboardCard from "./EboardCard";
import MemberModal from "./MemberModal";
import "./CSS/EboardStyles.css";

// MUI Icons
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const Eboard = ({ user }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const isAdmin = user && user.username === "Admin";

  // Helper function to set token as cookie
  const setTokenCookie = () => {
    const token = localStorage.getItem('token');
    if (token) {
      document.cookie = `token=${token}; path=/; max-age=${24 * 60 * 60}; SameSite=Strict`;
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/members`);
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

const handleModalSubmit = async (formData) => {
  setModalLoading(true);

  try {
    const token = localStorage.getItem("token");
    
    // DEBUG: Log token info
    console.log("=== FRONTEND DEBUG ===");
    console.log("Token exists:", !!token);
    console.log("Token preview:", token ? token.substring(0, 50) + "..." : "No token");
    console.log("User object:", user);
    console.log("Is Admin:", isAdmin);
    console.log("API URL:", API_URL);

    if (!token) {
      alert("No authentication token found. Please log in again.");
      return;
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    console.log("Request config:", config);
    console.log("Form data:", formData);

    if (editingMember) {
      const response = await axios.put(
        `${API_URL}/api/members/${editingMember.id}`,
        formData,
        config
      );
      setMembers((prev) =>
        prev.map((member) =>
          member.id === editingMember.id ? response.data : member
        )
      );
    } else {
      const response = await axios.post(
        `${API_URL}/api/members`,
        formData,
        config
      );
      setMembers((prev) => [response.data, ...prev]);
    }

    setShowModal(false);
    setEditingMember(null);
  } catch (error) {
    console.error("=== ERROR DEBUG ===");
    console.error("Full error:", error);
    console.error("Error response:", error.response);
    console.error("Error status:", error.response?.status);
    console.error("Error data:", error.response?.data);

    if (error.response?.status === 401) {
      alert("Authentication failed. Please log in again.");
      return;
    }
    
    const errorMessage = error.response?.data?.error || error.message || "Failed to save member";
    alert(errorMessage);
  } finally {
    setModalLoading(false);
  }
};

  const handleEdit = (member) => {
    setEditingMember(member);
    setShowModal(true);
  };

  const handleDelete = async (memberId) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("You must be logged in");
      }

      // Set token as cookie before making request
      setTokenCookie();

      await axios.delete(`${API_URL}/api/members/${memberId}`, {
        withCredentials: true
      });
      
      setMembers((prev) => prev.filter((member) => member.id !== memberId));
    } catch (error) {
      console.error("Error deleting member:", error);
      alert("Failed to delete member. Please try again.");
    }
  };

  const openCreateModal = () => {
    setEditingMember(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMember(null);
  };

  if (loading) {
    return (
      <div className="eboard-container">
        <div className="eboard-content">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading our amazing team...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="eboard-container">
      <div className="eboard-content">
        <div className="eboard-header">
          <div className="header-content">
            <h1>Meet Our E-Board</h1>
            <p>Get to know the passionate individuals leading our organization</p>
          </div>
          {isAdmin && (
            <button className="add-member-btn" onClick={openCreateModal}>
              <AddIcon className="btn-icon" />
              Add Member
            </button>
          )}
        </div>

        <div className="members-grid">
          {members.length === 0 ? (
            <div className="no-members">
              <PeopleIcon className="no-members-icon" />
              <h3>No members added yet</h3>
              <p>Check back soon to meet our amazing team!</p>
              {isAdmin && (
                <button
                  className="create-first-member-btn"
                  onClick={openCreateModal}
                >
                  <AutoAwesomeIcon className="btn-icon" />
                  Add Your First Member
                </button>
              )}
            </div>
          ) : (
            members.map((member) => (
              <EboardCard
                key={member.id}
                member={member}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>

      <MemberModal
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        editingMember={editingMember}
        loading={modalLoading}
      />
    </div>
  );
};

export default Eboard;