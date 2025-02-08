import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import { toast } from "react-toastify"; 
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [loginType, setLoginType] = useState("admin/user-login");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

 
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      toast.success("You are already logged in.");
      navigate("/home"); // Redirect to admin page
    }
  }, [navigate]);

  let isLogin;
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/${loginType}`, {
        email,
        password,
        recaptchaToken,
      });

      const { id, token } = response.data;

      // Store token and expiration time (1 minute for testing purposes)
      localStorage.setItem("token", token);
      localStorage.setItem("id", id); // Store ID in local storage
      localStorage.setItem("username", username);
      localStorage.setItem("email", email);
      localStorage.setItem("loginType", loginType);
       toast.success('Logged in Successfully', {
    position: "top-center",

    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    });
      navigate(`/home`);
    } catch (error) {
      console.error("Login error:", error);
      isLogin = false;
      toast.error(
        error.response?.data?.error || "An error occurred. Please try again."
      );
    }
  };

  const handleRecaptchaRefresh = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
      setRecaptchaToken(""); // Clear the token when reCAPTCHA is refreshed
    }
  };
  const siteKey = import.meta.env.VITE_REACT_APP_SITE_KEY; // Accessing the site key

  return (
    <>
      <div className="flex flex-grow items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-around mb-4">
              <label>
                <input
                  type="radio"
                  name="loginType"
                  value="admin"
                  checked={loginType === "admin"}
                  onChange={(e) => setLoginType(e.target.value)}
                  className="mr-2"
                />
                Admin
              </label>
              <label>
                <input
                  type="radio"
                  name="loginType"
                  value="admin/user-login"
                  checked={loginType === "admin/user-login"}
                  onChange={(e) => setLoginType(e.target.value)}
                  className="mr-2"
                />
                User
              </label>
            </div>
            
            <input
              type="email"
              placeholder="Enter email id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-md"
              required
            />
             <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"} // Toggle between text and password
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded-md"
                required
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute right-3 top-3"
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />} 
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleRecaptchaRefresh}
                className="text-blue-500 hover:underline"
              >
                <MdRefresh className="w-10 h-8 text-black" />
              </button>
              <ReCAPTCHA
                sitekey={siteKey}
                onChange={setRecaptchaToken}
                ref={recaptchaRef}
                className="ml-2"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white w-full py-2 rounded-md hover:bg-blue-600"
            >
              Login
            </button>
          </form>
          {loginType === "admin" && (
            <div className="text-center mt-4">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
          )}
          {loginType === "admin/user-login" && (
            <div className="text-center mt-4">
              <Link to="/user-forgot-password">Forgot Password?</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LoginPage;
