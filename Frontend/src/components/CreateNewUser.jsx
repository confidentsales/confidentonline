import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../Layouts/SideBar";
import { toast } from "react-toastify"; 
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEyeSlash } from "react-icons/fa"; 

function CreateNewUser() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false); 
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email in the format: someone@gmail.com");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("Password must be at least 8 characters long and contain at least one letter, one number, and one special character.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please confirm your password correctly.");
      return;
    }

    try {
      const response = await axios.post("/api/users/new_user", {
        username,
        password,
        email
      });

      toast.success('New User Created Successfully', {
        position: "top-center",
    
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        });
      navigate("/admin/logout");
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // Handle specific error for email already exists
        toast.error(error.response.data.message || "Email already exists");
      } else {
        toast.error("Error:", error);
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-grow"> 
      <SideBar />
      <div className="flex flex-col flex-grow items-center justify-center p-8 rounded-lg shadow-lg">
        <div className="w-full border p-12 rounded-2xl bg-gray-200 shadow-xl mt-10 max-w-md">
          <h1 className="text-3xl mb-5 text-center font-semibold">
            Create New User
          </h1>
          <form onSubmit={handleSubmit}>
            <label className="font-semibold">Username</label>
            <input
              type="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full"
              required
            />
            
            <label className="font-semibold">Password</label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"} // Toggle between text and password
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full"
                required
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)} // Toggle password visibility
                className="absolute right-3 top-3"
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />} {/* Eye Icon */}
              </button>
            </div>

            <label className="font-semibold">Confirm Password</label>
            <div className="relative">
              <input
                type={confirmPasswordVisible ? "text" : "password"} // Toggle between text and password
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full"
                required
              />
              <button
                type="button"
                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)} // Toggle confirm password visibility
                className="absolute right-3 top-3"
              >
                {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />} {/* Eye Icon */}
              </button>
            </div>

            <label className="font-semibold">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full"
              required
            />

            <button className="bg-blue-500 hover:bg-blue-600 w-full mt-5 py-2 rounded-xl font-semibold text-white">
              Create
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateNewUser;
