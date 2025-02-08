import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  Typography,
  TextField,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import SideBar from "../Layouts/SideBar";
import { Link } from "react-router-dom";

const BackupAndRestore = () => {
  const [backupData, setBackupData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    fetchBackupData();
  }, []);

  const fetchBackupData = async () => {
    try {
      const res = await axios.get("/api/backup/get-backups");
      setBackupData(res.data);
    } catch (error) {
      setError("Error fetching backup data");
    } finally {
      setLoading(false);
    }
  };

  const backupAllData = async () => {
    setBackupLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await axios.post("/api/backup/backup-all", { fileName });
  
      if (response.data.message === "No new data to backup") {
        setSuccessMessage("No new data to backup"); // Show a more accurate message
      } else if (response.status === 200 && response.data.fileUrl) {
        setSuccessMessage("Backup created successfully");
        fetchBackupData(); // Refresh the list of backups
      } else {
        setError("No new data to backup");
      }
      
      setFileName("");
    } catch (error) {
      setError("Error backing up data");
    } finally {
      setBackupLoading(false);
    }
  };
  
  

  const restoreData = async (fileName) => {
    setRestoreLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axios.post(`/api/backup/restore/${fileName}`);

      if (response.status === 200) {
        setSuccessMessage("Data restored successfully!");
        fetchBackupData();
      } else {
        setError("Error restoring data. Please try again.");
      }
    } catch (error) {
      console.error("Error restoring data:", error);
      setError("Error restoring data. Please try again.");
    } finally {
      setRestoreLoading(false);
    }
  };

  const deleteBackup = async (fileName) => {
    setError(null);
    setSuccessMessage(null);
  
    // Ensure fileName is not empty
    if (!fileName || fileName.trim() === "") {
      setError("File name is required");
      return;
    }
  
    try {
      // Encode fileName if it contains spaces or special characters
      const encodedFileName = encodeURIComponent(fileName);
  
      // Debugging: log the encoded file name
      console.log("Encoded file name to send: ", encodedFileName);
  
      // Send DELETE request to backend with encoded fileName
      const response = await axios.delete(`/api/backup/delete-backup/${encodedFileName}`);
  
      if (response.status === 200) {
        setSuccessMessage("Backup file deleted successfully!");
        fetchBackupData(); // Fetch the updated list of backups
      } else {
        setError("Error deleting backup file");
      }
    } catch (error) {
      console.error("Error deleting backup file:", error);
      // Improved error handling to log full error response
      setError(error.response?.data?.message || "Error deleting backup file");
    }
  };
  
  
  
  

  const downloadBackup = (fileName) => {
    const cloudinaryUrl = `https://res.cloudinary.com/dgwe30jly/raw/upload/v1735189944/backups/${fileName}`;

    // Create an invisible link
    const link = document.createElement("a");
    link.href = cloudinaryUrl; // Point this to the actual Cloudinary URL (not your backend URL)
    link.setAttribute("download", fileName); // This will set the downloaded file's name

    // Append the link to the document, trigger the download, and then remove the link
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  return (
    <div className="flex flex-grow">
      <SideBar />
      <div className="w-full ">
        <Container sx={{ mt: 4, mb: 4 }}>
          <h2 className=" text-3xl text-center font-bold mb-5 ">
            Backup and Restore
          </h2>
          <Link
            to={"/admin/backup-restore/deleted-data"}
            className="bg-red-500 p-3 text-white rounded-lg"
          >
            {"View Deleted Data"}
          </Link>
          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <TextField
              label="Backup File Name"
              variant="outlined"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              sx={{ width: 250 }}
            />
            <button
              className="bg-gray-500 p-3 text-white rounded-lg"
              onClick={backupAllData}
            >
              {backupLoading ? (
                <CircularProgress size={24} />
              ) : (
                "Backup All Data"
              )}
            </button>
          </Stack>

          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : backupData.length === 0 ? (
            <Alert severity="info">No backup data available</Alert>
          ) : (
            <div style={{ height: 800, width: "100%" }}>
              <DataGrid
                rows={backupData.map((file) => ({
                  id: file.fileName, // Ensure the row has a unique ID (fileName is a unique key here)
                  fileName: file.fileName,
                  url: file.url, // If you want to display URLs or other data
                  created_at: file.created_at, // You can also display other metadata like created_at
                }))}
                columns={[
                  { field: "fileName", headerName: "Backup File", width: 300 },
                  {
                    field: "actions",
                    headerName: "Actions",
                    width: 500,
                    renderCell: (params) => (
                      <div>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => restoreData(params.row.fileName)}
                          style={{ marginRight: "10px" }}
                        >
                          Restore
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => downloadBackup(params.row.fileName)}
                          style={{ marginRight: "10px" }}
                        >
                          Download
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => deleteBackup(params.row.fileName)} // Delete button calls deleteBackup
                        >
                          Delete
                        </Button>
                      </div>
                    ),
                  },
                ]}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50]}
                getRowId={(row) => row.fileName} // Ensure the row ID is based on the file name
              />
            </div>
          )}

          <Snackbar
            open={Boolean(successMessage)}
            autoHideDuration={2000}
            onClose={() => setSuccessMessage(null)}
          >
            <Alert onClose={() => setSuccessMessage(null)} severity="success">
              {successMessage}
            </Alert>
          </Snackbar>
          <Snackbar
            open={Boolean(error)}
            autoHideDuration={2000}
            onClose={() => setError(null)}
          >
            <Alert onClose={() => setError(null)} severity="error">
              {error}
            </Alert>
          </Snackbar>
        </Container>
      </div>
    </div>
  );
};

export default BackupAndRestore;
