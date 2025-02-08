import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { DataGrid, GridToolbarQuickFilter,GridToolbar } from "@mui/x-data-grid";
import SideBar from "../Layouts/SideBar";

const DeletedData = () => {
  const [backupData, setBackupData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [allSelected, setAllSelected] = useState(false);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
  
    // Options to format the date to "16 December 2024"
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
  
    // Use the 'en-GB' locale for formatting in "day month year" format
    const formattedDate = date.toLocaleDateString('en-GB', options);
    
    return formattedDate;
  };

  const handleSelectionModelChange = (newSelection) => {
    setSelectedIds(newSelection);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      alert("No records selected for deletion.");
      setOpenConfirmDialog(false);
      return;
    }
    setOpenConfirmDialog(true); // Open confirmation dialog
  };

  const confirmDeleteSelected = async () => {
    try {
      const allMobilenos = backupData.map((item) => item.mobileno);
      const isAllSelected =
        selectedIds.length === allMobilenos.length &&
        selectedIds.every((id) => allMobilenos.includes(id));

      if (isAllSelected) {
        await axios.delete("api/backup/delete/all");
        setSuccessMessage("All records deleted successfully!");
        setBackupData([]);
      } else {
        await Promise.all(
          selectedIds.map((mobileno) =>
            axios.delete(`/api/backup/delete/${mobileno}`)
          )
        );
        setSuccessMessage("Selected records deleted successfully!");
        setBackupData((prev) =>
          prev.filter((item) => !selectedIds.includes(item.mobileno))
        );
      }

      setSelectedIds([]);
      setOpenConfirmDialog(false); // Close confirmation dialog
    } catch (error) {
      setError("Error deleting selected data.");
      setOpenConfirmDialog(false); // Close confirmation dialog
    }
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      setAllSelected(false);
    } else {
      const allIds = backupData.map((item) => item.mobileno);
      setSelectedIds(allIds);
      setAllSelected(true);
    }
  };

  useEffect(() => {
    if (selectedIds.length === backupData.length) {
      setAllSelected(true);
    } else {
      setAllSelected(false);
    }
  }, [selectedIds, backupData]);

  useEffect(() => {
    const fetchBackupData = async () => {
      try {
        const res = await axios.get("/api/backup/get-backup");
        if (Array.isArray(res.data) && res.data.length > 0) {
          const formattedData = res.data.map((item) => ({
            ...item,
            backup_date: formatDateTime(item.backup_date),
          }));
          setBackupData(formattedData);
        } else {
          throw new Error("Backup data is not in the expected format or is empty");
        }
      } catch (error) {
        setError("no deleted data available");
      } finally {
        setLoading(false);
      }
    };

    fetchBackupData();
  }, []);

  const restoreData = async (mobileno) => {
    try {
      await axios.post("/api/backup/restore", { mobileno });
      setSuccessMessage("Data restored successfully!");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setError("Error restoring data");
    }
  };

  const deleteData = async (mobileno) => {
    try {
      const allMobilenos = backupData.map((item) => item.mobileno);
      const isAllSelected =
        selectedIds.length === allMobilenos.length &&
        selectedIds.every((id) => allMobilenos.includes(id));

      if (isAllSelected) {
        await axios.delete("api/backup/delete/all");
        setSuccessMessage("All data deleted successfully!");
        setBackupData([]);
        setSelectedIds([]);
      } else {
        await axios.delete(`/api/backup/delete/${mobileno}`);
        setSuccessMessage("Data deleted successfully!");
        setBackupData((prev) =>
          prev.filter((item) => item.mobileno !== mobileno)
        );
      }
    } catch (error) {
      setError("Error deleting data");
    }
  };

  function QuickSearchToolbar() {
    return (
      <Box sx={{ p: 0.5, pb: 0 }}>
        <GridToolbarQuickFilter />
      </Box>
    );
  }

  const columns = [
    { field: "mobileno", headerName: "Mobile No", width: 150 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "operation_type", headerName: "Operation", width: 150 },
    { field: "backup_date", headerName: "Backup Date", width: 250 },
    {
      field: "actions",
      headerName: "Actions",
      width: 300,
      renderCell: (params) => (
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={() => restoreData(params.row.mobileno)}
            style={{ marginRight: "10px" }}
          >
            Restore
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteData(params.row.mobileno)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-grow">
      <SideBar />
      <div className="" style={{width:"80%"}}>
        <Container sx={{ mt: 4, mb: 4 }}>
          <h2 className="text-center text-2xl mb-5">Backup and Restore</h2>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteSelected}
            style={{ marginBottom: "20px" }}
          >
            Delete Selected
          </Button>
          {/* <Button
            variant="contained"
            color={allSelected ? "secondary" : "primary"}
            onClick={toggleSelectAll}
            style={{ marginBottom: "20px", marginLeft: "10px" }}
          >
            {allSelected ? "Deselect All" : "Select All"}
          </Button> */}

          {loading ? (
            <CircularProgress />
          ) : backupData.length === 0 ? (
            <Alert severity="info">No backup data available</Alert>
          ) : (
            <div style={{ height: "67vh", width: "100%" }}>
              <DataGrid
                rows={backupData}
                columns={columns}
                pageSize={10}
                slots={{ toolbar: GridToolbar }}
                rowsPerPageOptions={[10, 20, 50]}
                getRowId={(row) => row.mobileno || Math.random()}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                    printOptions: { disableToolbarButton: true },
                  },
                }}
                onRowSelectionModelChange={handleSelectionModelChange}
                selectionModel={selectedIds}
                checkboxSelection
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

          <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete the selected records? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenConfirmDialog(false)} color="primary">Cancel</Button>
              <Button onClick={confirmDeleteSelected} color="secondary">Confirm</Button>
            </DialogActions>
          </Dialog>
        </Container>
      </div>
    </div>
  );
};

export default DeletedData;
