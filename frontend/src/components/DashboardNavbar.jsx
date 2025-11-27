import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaSignOutAlt } from "react-icons/fa";

const DashboardNavbar = ({ userRole }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const userKey = userRole === "customer" ? "customerUser" : "providerUser";
    const userData = localStorage.getItem(userKey);
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.name || "User");
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUserName("User");
      }
    } else {
      navigate(userRole === "customer" ? "/customer/login" : "/provider/login");
    }
  }, [userRole, navigate]);

  useEffect(() => {
    const handleUserUpdated = () => {
      const userKey = userRole === "customer" ? "customerUser" : "providerUser";
      const userData = localStorage.getItem(userKey);
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserName(user.name || "User");
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    };

    window.addEventListener("userUpdated", handleUserUpdated);
    return () => window.removeEventListener("userUpdated", handleUserUpdated);
  }, [userRole]);

  const handleLogout = () => {
    if (userRole === "customer") {
      localStorage.removeItem("customerToken");
      localStorage.removeItem("customerUser");
    } else if (userRole === "provider") {
      localStorage.removeItem("providerToken");
      localStorage.removeItem("providerUser");
    }
    localStorage.removeItem("userRole");
    
    navigate("/");
  };

  const bgColor = userRole === "customer" ? "bg-yellow-400" : "bg-purple-400";
  const hoverBg = userRole === "customer" ? "hover:bg-yellow-300" : "hover:bg-purple-300";

  return (
    <nav className={`${bgColor} border-b-4 border-black px-4 py-2.5 flex items-center justify-between`}>
      <div className="flex items-center space-x-3">
        <h1 className="brutal-heading text-lg md:text-xl">
          {userRole === "customer" ? "CUSTOMER ZONE 🎯" : "PROVIDER HUB 💼"}
        </h1>
      </div>

      <div className="flex items-center space-x-2.5">
        <div className="brutal-card-sm bg-white p-1.5 flex items-center space-x-2 transform -rotate-1">
          <div className="bg-black text-white rounded-full p-1.5">
            <FaUser className="text-xs" />
          </div>
          <div className="text-left">
            <p className="font-black uppercase text-xs">{userName}</p>
            <p className="font-bold text-xs text-gray-600 uppercase">{userRole}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="brutal-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 flex items-center space-x-1.5"
        >
          <FaSignOutAlt className="text-xs" />
          <span className="font-black uppercase text-xs">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
