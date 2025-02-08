import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../FloatingRedirect.css"; // Import the CSS for styling
import { BiSolidHome } from "react-icons/bi";

const FloatingRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

 
  const isLoginPage =
    location.pathname === "/login" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/user-forgot-password";

  const handleClick = () => {
    navigate("/home");
  };

  // Render nothing if on the login page
  if (isLoginPage) {
    return null; // Don't render the floating object on the login page
  }

  return (
    <div className="floating-object bg-red-600" onClick={handleClick}>
      {/* <img style={{ height: '40px' }} src="../home.png" alt="Home" className="image" /> */}
      <BiSolidHome style={{ height: "30px", width: "30px" }} />
    </div>
  );
};

export default FloatingRedirect;
