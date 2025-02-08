import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import SideBar from "../Layouts/SideBar";
import { CircularProgress } from "@mui/material";
import { useLocation } from "react-router-dom";
import LoadingOverlay from "../Layouts/LoadingOverlay"; 
import { DataGrid } from "@mui/x-data-grid";
import { format } from 'date-fns'; // Import date-fns to format the date




function SalesTestData() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [genuineCount, setGenuineCount] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]); // Store error messages

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const location = useLocation();

  useEffect(() => {
    // Check if we are on the AdminPage
    if (location.pathname === "/sales/test-data") {
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setMessage("Please upload a file.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("username", localStorage.getItem("username"));

    try {
      const response = await axios.post("", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.results) {
        setResults(response.data.results);
        setDuplicateCount(response.data.duplicateCount);
        setGenuineCount(response.data.genuineCount);
        setDownloadUrl(response.data.downloadUrl); // Set the URL returned from the backend

        setMessage("File processed successfully.");
        setShowModal(true);
      } else {
        setMessage("No results found.");
      }
    } catch (error) {
      console.log(error.response);
      const {
        message: errorMessage,
        duplicates,
        invalidHeaders,
      } = error.response.data || {};

      // Collect error messages
      const errors = [];
      if (errorMessage) errors.push(errorMessage);
      if (duplicates && duplicates.length > 0) {
        errors.push(`Duplicates: ${duplicates.join(", ")}`);
      }
      if (invalidHeaders && invalidHeaders.length > 0) {
        errors.push(`Invalid headers: ${invalidHeaders.join(", ")}`);
      }
      if (error.response && error.response.data && error.response.data.error) {
        errors.push(`Error: ${error.response.data.error}`);
      }

      setErrorMessages(errors);
      setMessage(errors.join(" | "));

      // Clear error messages after 5 seconds
      setTimeout(() => {
        setErrorMessages([]);
        setMessage("");
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = () => {
    if (!downloadUrl) return;

    const link = document.createElement("a");
    link.href = downloadUrl; // The correct download URL returned by backend
    link.setAttribute("download", "output.xlsx"); // Optional: set filename
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const closeModal = () => {
    setShowModal(false);
    setFile(null);
    setErrorMessages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  
    const [logs, setLogs] = useState([]);
  
    useEffect(() => {
      const fetchLogs = async () => {
        try {
          const response = await axios.get("");
          setLogs(response.data);
        } catch (error) {
          console.error("Error fetching logs:", error);
        }
      };
  
      fetchLogs();
    }, []);
  
    const columns = [
      {
        field: "id",
        headerName: "Sl No",
        width: 150,
        renderHeader: () => (
          <div className="text-base font-poppins font-semibold">SL No</div>
        ),
      },
      {
        field: "username",
        headerName: "Username",
        width: 150,
        renderHeader: () => (
          <div className="text-base font-poppins font-semibold">Username</div>
        ),
      },
      {
        field: "file_name",
        headerName: "File Name",
        width: 200,
        renderHeader: () => (
          <div className="text-base font-poppins font-semibold">
            File Name
          </div>
        ),
      },
      {
        field: "genuine_count",
        headerName: "Inserted Count",
        width: 150,
        renderHeader: () => (
          <div className="text-base font-poppins font-semibold">
            Genuine Count
          </div>
        ),
      },
      {
        field: "duplicate_count",
        headerName: "Duplicate Count",
        width: 150,
        renderHeader: () => (
          <div className="text-base font-poppins font-semibold">
            Duplicate Count
          </div>
        ),
      },
      {
        field: "created_at",
        headerName: "Timestamp",
        width: 200,
        renderHeader: () => (
          <div className="text-base font-poppins font-semibold">
            Timestamp
          </div>
        ),
        renderCell: (params) => {
          const date = new Date(params.value);
          return date.toLocaleString("en-IN") || "N/A";
        },
      },
    ];
  

  return (
    <div className="flex flex-grow ">
      <SideBar />
      <div className="flex flex-col flex-grow items-center justify-center p-4">
        <div className="w-full mt-10 max-w-md">
          <h1 className="text-4xl font-bold mb-6 text-center">
            Sales Data Test
          </h1>
          <p className="text-red-500 text-center">
            Note: The Excel file must contain less than 25,000 rows of data for
            testing.
          </p>
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded px-8 py-6"
          >
            <input
              type="file"
              onChange={handleFileChange}
              accept=".xlsx"
              className="block m-2 w-full mb-4 text-sm text-gray-500 border border-gray-300 rounded cursor-pointer focus:outline-none focus:ring focus:ring-blue-500"
              ref={fileInputRef}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-semibold py-2 rounded hover:bg-blue-600 transition duration-200"
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Upload and Analyze"
              )}
            </button>
            {/* Show loading overlay when loading is true */}
            {loading && (
              <LoadingOverlay message="Analyzing data, please wait..." />
            )}
            {/* Display error messages */}
            {errorMessages.length > 0 && (
              <div className="text-red-500">
                {errorMessages.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </form>

          {/* Modal for displaying results */}
          {showModal && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-3/4 md:w-1/2 p-8">
                {message && <p className="mt-4 text-red-500">{message}</p>}
                <h2 className="text-xl font-semibold mb-4">Results</h2>
                <p className="mb-2">Duplicate Count: {duplicateCount}</p>
                <p className="mb-4">Genuine Count: {genuineCount}</p>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={downloadFile}
                    className="bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-600 transition duration-200"
                    disabled={!downloadUrl}
                  >
                    Download Results
                  </button>
                  <button
                    onClick={closeModal}
                    className="bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-10 mb-10" style={{height:'50vh',width:'60%'}}>
        <h1 className="text-3xl font-bold mb-2  text-center">
             Test Logs
          </h1>
        <DataGrid
               rows={logs}
              columns={columns}
              rowHeight={35}
              pageSize={10}
              rowsPerPageOptions={[10]}
              getRowId={(row) => row.id}
            />
        </div>
      </div>
    </div>
  );
}

export default SalesTestData;
