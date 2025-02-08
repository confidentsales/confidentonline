import React, { useEffect } from 'react';
import SideBar from "../Layouts/SideBar";
import User from "../assets/user.png";
import { Link, useLocation } from 'react-router-dom';
import Sales from "../assets/sales.png";



function HomePage() {
  const location = useLocation();

  useEffect(() => {
    // Check if we are on the AdminPage
    if (location.pathname === "/home") {
      const hasVisited = sessionStorage.getItem("hasVisitedAdminPage");
  
      // If it hasn't been visited, set the flag and reload the page
      if (!hasVisited) {
        sessionStorage.setItem("hasVisitedAdminPage", "true");
        window.location.reload();
      } else {
        // Reset the session storage for future visits
        sessionStorage.removeItem("hasVisitedAdminPage");
      }
    }
  }, [location.pathname]);

  return (
    <>
      <div className="flex flex-grow bg-gray-300 ">
        {/* Sidebar */}
        <SideBar />

        {/* Main Content */}
        <div className="flex flex-col ml-4 mt-6 sm:ml-8  md:ml-12  lg:ml-16 w-full">
          {/* Header */}
          <h1 className="font-bold text-3xl sm:text-3xl md:text-4xl mb-6 text-center lg:mt-16 lg:mb-12">
            Home Page
          </h1>

          {/* Responsive Grid */}
          <div className="grid gap-8 sm:gap-12 md:gap-16 grid-cols-1 sm:grid-cols-2 justify-items-center px-4 sm:px-8 md:px-12 lg:px-16">
            {/* User Data Link */}
            <Link
              to={'/admin'}
              className="flex flex-col justify-center items-center h-72 w-full max-w-sm bg-white rounded-md shadow-xl text-xl font-bold"
            >
              <img className="h-36 mb-4" src={User} alt="user" />
              User Data
            </Link>

            {/* Sales Data Link */}
            <Link
              to={"/home/sales"}
              className="flex flex-col justify-center items-center h-72 w-full max-w-sm bg-white rounded-md shadow-xl text-xl font-bold"
            >
              <img className="h-36 mb-4" src={Sales} alt="sales" />
              Sales Data
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
