import React, { useEffect, useContext, useState } from "react";
import { Link, useNavigate,useLocation } from "react-router-dom";
import axios from "axios";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { UserContext } from "./UserContext";
import SideBar from "../Layouts/SideBar";
import { Box, Button, Checkbox, Chip, Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import Eye from '../assets/eye.png';
import { toast } from "react-toastify"; 
import 'react-toastify/dist/ReactToastify.css';
import columns from "../Layouts/columns";


const calculateAge = (createDate) => {
  if (!createDate) return " ";

  const now = new Date();
  const birthDate = new Date(createDate);
  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  let days = now.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth(), 0);
    days += lastMonthDate.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years} years, ${months} months, ${days} days`;
};

// Utility function to format date as dd-mm-yyyy
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);

  // Options to format the date to "16 December 2024"
  const options = { day: 'numeric', month: 'long', year: 'numeric' };

  // Use the 'en-GB' locale for formatting in "day month year" format
  const formattedDate = date.toLocaleDateString('en-GB', options);
  
  return formattedDate;
};




// Header rendering utility
const renderHeader = (label) => (
  <div className="text-base font-poppins font-semibold">{label}</div>
);

const UserList = () => {
  const { users, fetchUsers } = useContext(UserContext);
  const [processedUsers, setProcessedUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // useEffect(() => {
  //   // Check if we are on the AdminPage
  //   if (location.pathname === "/admin/view") {
  //     const hasVisited = sessionStorage.getItem("hasVisitedAdminPage");

  //     // If it hasn't been visited, set the flag and reload the page
  //     if (!hasVisited) {
  //       sessionStorage.setItem("hasVisitedAdminPage", "true");
  //       window.location.reload();
  //     } else {
  //       // Reset the session storage for future visits
  //       sessionStorage.removeItem("hasVisitedAdminPage");
  //     }
  //   }
  // }, [location.pathname]); 


  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await axios.get("/api/contacts");
        // Check if response.data is an array, if not, adjust according to the structure
        const usersData = Array.isArray(response.data)
          ? response.data
          : response.data.contacts || [];

        const mobileNumberCount = usersData.reduce((acc, user) => {
          const mobileno = user.mobileno || "";
          if (mobileno) {
            acc[mobileno] = (acc[mobileno] || 0) + 1;
          }
          return acc;
        }, {});

        const processed = usersData.map((user) => {
          ({ ...user, id: user.sl_no })
          const mobileno = user.mobileno || "";
          const length = mobileno.length;
          const count = mobileNumberCount[mobileno] || 0;
          let tagsArray = typeof user.tags === "string" ? user.tags.split(",") : user.tags;
          let enquiryArray = typeof user.enquiry === "string" ? user.enquiry.split(",") : user.enquiry;
          if (typeof user.tags === "string") {
            tagsArray = user.tags
              .replace(/{|}/g, "") 
              .replace(/"/g, "")   
              .split(",")          
              .map(tag => tag.trim()); 
          }
          if (typeof user.enquiry === "string") {
            enquiryArray = user.enquiry
              .replace(/{|}/g, "") 
              .replace(/"/g, "")   
              .split(",")          
              .map(tag => tag.trim()); 
          }
          return {
            ...user,
            id: user.sl_no, 
            length,
            count,
            age: calculateAge(user.create_date),
            last_purchased_date: formatDate(user.last_purchased_date),
            create_date: formatDate(user.create_date),
            last_updated_date: formatDate(user.last_updated_date),
            tags: tagsArray, 
            enquiry:enquiryArray,
          };
        });

        setProcessedUsers(processed);

        const allUserIds = processed.map((user) => user.sl_no);
        setSelectedIds(allUserIds);


      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    const hasReload = sessionStorage.getItem("hasReload");
    if (!hasReload) {
      sessionStorage.setItem("hasReload", "true");
      window.location.reload();
    }
  }, []);

  const handleDeleteClick = () => {
    if (processedUsers.length === 0) {
      toast.warning('No data available to delete', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return; // Prevent modal from opening
    }
  
    if (selectedIds.length === 0) {
      toast.warning('No data selected for deletion', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return; 
    }
      setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleConfirmDelete = async () => {
    if (selectedIds.length === 0) {
      alert("No users selected for deletion.");
      return;
    }
  
    try {
      if (selectedIds.length === processedUsers.length) {
        // All users are selected, call handleDeleteAllUsers endpoint
        const response = await axios.delete("api/contacts/delete/all");
  
        if (response.status === 200) {
          setProcessedUsers([]); // Clear all users from the UI
          setSelectedIds([]);
          toast.success('All users deleted successfully', {
            position: "top-center",
            width:"400px",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            });        }
      } else {
        // Not all users selected, delete individually
        const response = await axios.delete("/api/contacts", {
          data: { ids: selectedIds },
        });
  
        if (response.status === 200) {
          setProcessedUsers((prev) =>
            prev.filter((user) => !selectedIds.includes(user.sl_no))
          );
          setSelectedIds([]);
          toast.success('Selected users deleted Successfully', {
            position: "top-center",
            width:"400px",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            });
        }
      }
    } catch (error) {
      console.error("Error deleting users:", error);
      toast.error("An error occurred while deleting users.");
    }
  
    handleCloseModal();
  };
  

  const handleSelectionModelChange = (newSelection) => {
    setSelectedIds(newSelection);
  };

  const columnsWithActions = [
    {
      field: "actions",
      headerName: "Actions",
      width: 50,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Actions</div>
      ),
      renderCell: (params) => (
        <button
          className="ml-2 w-5 h-5"
          onClick={() => navigate(`/users/${params.row.sl_no}`)}
        >
          <img src={Eye} alt="View" />
        </button>
      ),
    },
    ...columns
  ];
 



  return (
    <>
      <div className="flex flex-grow ">
        
        <SideBar  />

        <div className="flex-grow m-4 mb-20  " style={{ width: "80%" ,height: '80vh' }}>
          <div className="mb-5">
            <Link
              className="bg-blue-300 px-2 py-1 m-1 rounded-xl"
              to={"/admin/test-data"}
              variant="contained"
              color="primary"
            >
              Import Excel
            </Link>
            <button className="bg-red-500 px-2 py-1 m-1 rounded-xl text-white" onClick={handleDeleteClick}>
            Delete Selected
          </button>
          </div>
          <div className="h-full bg-gray-100 w-full">
            <DataGrid
              rows={processedUsers}
              columns={columnsWithActions}
              rowHeight={35}
              slots={{ toolbar: GridToolbar }}
              pageSize={10}
              rowsPerPageOptions={[10]}
              getRowId={(row) => row.sl_no}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  printOptions: { disableToolbarButton: true },
                },
              }}
              initialState={{
                sorting: {
                  sortModel: [{ field: "sl_no", sort: "asc" }],
                },
              }}
              onRowSelectionModelChange={handleSelectionModelChange} // Correct event handler
              selectionModel={selectedIds}
              checkboxSelection
              disableRowSelectionOnClick
            />
          </div>
         {/* Confirmation Dialog */}
         <Dialog open={openModal} onClose={handleCloseModal}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete the selected users? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal} color="primary">
                Cancel
              </Button>
              <Button onClick={handleConfirmDelete} color="secondary">
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default UserList;
