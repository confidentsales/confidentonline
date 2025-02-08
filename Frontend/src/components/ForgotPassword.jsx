import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [step, setStep] = useState(1); // Step 1: Request OTP, Step 2: Verify OTP, Step 3: Reset Password
  const [message, setMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();
  

  const handleClick=()=>{
    setShow(!show)
  }

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression for email validation
    return emailRegex.test(email);
  };

  const handleRequestOtp = async () => {
    if (!validateEmail(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }
    try {
      const response = await axios.post("/api/adminReset/forgot-password", {
        email,
      });
      setMessage(response.data.message);
      setStep(2); // Move to verify OTP
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post("/api/adminReset/verify-otp", {
        email,
        otp,
      });
      setMessage(response.data.message);
      setStep(3); // Move to reset password
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePassword(newPassword)) {
      setMessage(
        "Password must be at least 8 characters long, contain at least one letter, one number, and one special character."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords are not matching.");
      return;
    }

    try {
      const response = await axios.post("/api/adminReset/reset-password", {
        email,
        newPassword,
      });
      setMessage(response.data.message);
      alert("Password reset successfully");
      navigate("/login");
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-gray-200 p-24 rounded-lg">
        <h2 className="font-bold text-2xl mb-5">Forgot Password</h2>
        {message && <p className="text-red-600 mb-2">{message}</p>}
        {step === 1 && (
          <div>
            <input
              className="border-black hover:bg-gray-100 mr-4 p-3 rounded-md"
              type="text"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              className="bg-red-500 hover:bg-red-600 p-2 text-white rounded-md"
              onClick={handleRequestOtp}
            >
              Send OTP
            </button>
          </div>
        )}
        {step === 2 && (
          <div>
            <input
              className="mt-2 border-black hover:bg-gray-100 mr-4 p-3 rounded-md"
              type="text"
              placeholder="Enter the OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button
              className="bg-red-500 hover:bg-red-600 p-2 text-white rounded-md"
              onClick={handleVerifyOtp}
            >
              Verify OTP
            </button>
          </div>
        )}
        {step === 3 && (
          <div>
             <div className="mb-3 relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="border-black hover:bg-gray-100 p-3 rounded-md w-full"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute top-8 right-5 text-gray-500"
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />} {/* Eye Icon */}
              </button>
            </div>


            <div className="mb-3 relative">
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-black hover:bg-gray-100 p-3 rounded-md w-full"
              />
              <button
                type="button"
                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                className="absolute top-8 right-5 text-gray-500"
              >
                {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />} {/* Eye Icon */}
              </button>
            </div>

            <button
              className="mt-3 bg-red-500 hover:bg-red-600 p-2 text-white rounded-md"
              onClick={handleResetPassword}
            >
              Reset Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
