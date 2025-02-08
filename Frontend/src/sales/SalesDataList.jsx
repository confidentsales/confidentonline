import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import SideBar from "../Layouts/SideBar";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Eye from "../assets/eye.png";
import { toast } from "react-toastify"; 
import 'react-toastify/dist/ReactToastify.css';

import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

function SalesDataList() {
  const [rows, setRows] = useState("");
  const [processedUsers, setProcessedUsers] = useState([]);
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const location = useLocation();

  const columns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 50,
      renderHeader: () => (
        <div className="text-base font-poppins font-semibold">Actions</div>
      ),
      renderCell: (params) => (
        <button
          className="ml-2 w-5 h-5 "
          onClick={() => navigate(`/sales/${params.row.sl_no}`)}
        >
          <img src={Eye} alt="View" />
        </button>
      ),
    },
    {
      field: "sl_no",
      headerName: "Sl No",
      width: 100,
      renderHeader: () => <div className="text-base font-semibold ">Sl No</div>,
    },
    {
      field: "year",
      headerName: "Year",
      width: 150,
      renderHeader: () => <div className="text-base font-semibold">Year</div>,
    },
    {
      field: "sales_person",
      headerName: "Sales Person",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold ">Sales Person</div>
      ),
    },
    {
      field: "voucher_number",
      headerName: "Voucher Number",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Voucher Number</div>
      ),
    },
    {
      field: "reference",
      headerName: "Reference",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Reference</div>
      ),
    },
    {
      field: "date",
      headerName: "Date",
      width: 150,
      renderHeader: () => <div className="text-base font-semibold">Date</div>,
    },
    {
      field: "month",
      headerName: "Month",
      width: 150,
      renderHeader: () => <div className="text-base font-semibold">Month</div>,
    },
    {
      field: "voucher_type",
      headerName: "Voucher Type",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Voucher Type</div>
      ),
    },
    {
      field: "party_name",
      headerName: "Party Name",
      width: 200,
      renderHeader: () => (
        <div className="text-base font-semibold">Party Name</div>
      ),
    },
    {
      field: "party_state",
      headerName: "Party State",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Party State</div>
      ),
    },
    {
      field: "district",
      headerName: "District",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">District</div>
      ),
    },
    {
      field: "party_alias",
      headerName: "Party Alias",
      width: 100,
      renderHeader: () => (
        <div className="text-base font-semibold">Party Alias</div>
      ),
    },
    {
      field: "party_ledger_parent",
      headerName: "Party Ledger Parent",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Party Ledger Parent</div>
      ),
    },
    {
      field: "gst_number",
      headerName: "GST NUMBER",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">GST NUMBER</div>
      ),
    },
    {
      field: "item_name",
      headerName: "Item Name",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Item Name</div>
      ),
    },
    {
      field: "item_alias",
      headerName: "Item Alias",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Item Alias</div>
      ),
    },
    {
      field: "item_hsncode",
      headerName: "Item HSNCODE",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Item HSNCODE</div>
      ),
    },
    {
      field: "item_part_no",
      headerName: "Item Part No",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Item Part No</div>
      ),
    },
    {
      field: "brand",
      headerName: "Brand (Item Group)",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Brand (Item Group)</div>
      ),
    },
    {
      field: "item_confident_group",
      headerName: "Item Confident Group",
      width: 200,
      renderHeader: () => (
        <div className="text-base font-semibold">Item Confident Group</div>
      ),
    },
    {
      field: "godown",
      headerName: "Godown",
      width: 200,
      renderHeader: () => <div className="text-base font-semibold">Godown</div>,
    },
    {
      field: "item_batch",
      headerName: "Item Batch",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Item Batch</div>
      ),
    },
    {
      field: "actual_quantity",
      headerName: "Acutal Quantity",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Acutal Quantity</div>
      ),
    },
    {
      field: "billed_quantity",
      headerName: "Billed Quantity",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Billed Quantity</div>
      ),
    },
    {
      field: "alternate_actual_quantity",
      headerName: "Alternate Actual Quantity",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Alternate Actual Quantity</div>
      ),
    },
    {
      field: "alternate_billed_quantity",
      headerName: "Alternate Billed Quantity",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Alternate Billed Quantity</div>
      ),
    },
    {
      field: "rate",
      headerName: "Rate",
      width: 150,
      renderHeader: () => <div className="text-base font-semibold">Rate</div>,
    },
    {
      field: "unit",
      headerName: "Unit",
      width: 150,
      renderHeader: () => <div className="text-base font-semibold">Unit</div>,
    },
    {
      field: "discount",
      headerName: "Discount",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Discount</div>
      ),
    },
    {
      field: "discount_amount",
      headerName: "Discount Amount",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Discount Amount</div>
      ),
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 150,
      renderHeader: () => <div className="text-base font-semibold">Amount</div>,
    },
    {
      field: "sales_ledger",
      headerName: "Sales Ledger ",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Sales Ledger</div>
      ),
    },
    {
      field: "narration",
      headerName: "Narration",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Narration</div>
      ),
    },
    {
      field: "offer_type",
      headerName: "Offer Type",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Offer Type</div>
      ),
    },
    {
      field: "last_updated_date",
      headerName: "Last Updated Date",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Last Updated Date</div>
      ),
    },
    {
      field: "mobileno",
      headerName: "Mobile No",
      width: 150,
      renderHeader: () => <div className="text-base font-semibold">Mobile No</div>,
    },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
  
    // Options to format the date to "16 December 2024"
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
  
    // Use the 'en-GB' locale for formatting in "day month year" format
    const formattedDate = date.toLocaleDateString('en-GB', options);
    
    return formattedDate;
  };

  useEffect(() => {
    const loadSalesData = async () => {
      try {
        const response = await axios.get("/api/sales");
        const usersData = Array.isArray(response.data)
          ? response.data
          : response.data.contacts || [];

        const processed = usersData.map((user) => {
          ({ ...user, id: user.sl_no });

          return {
            ...user,
            id: user.sl_no,
            date: formatDate(user.date),
            last_updated_date: formatDate(user.last_updated_date),
          };
        });

        setProcessedUsers(processed);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    loadSalesData();
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
      return; // Prevent modal from opening
    }
      setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleConfirmDelete = async () => {
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

    try {
      if (selectedIds.length === processedUsers.length) {
        // All users are selected, call handleDeleteAllUsers endpoint
        const response = await axios.delete("api/sales/delete/all");

        if (response.status === 200) {
          setProcessedUsers([]); // Clear all users from the UI
          setSelectedIds([]);
          toast.success('All data deleted Successfully', {
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
      } else {
        // Not all users selected, delete individually
        const response = await axios.delete("/api/sales", {
          data: { ids: selectedIds },
        });

        if (response.status === 200) {
          setProcessedUsers((prev) =>
            prev.filter((user) => !selectedIds.includes(user.sl_no))
          );
          setSelectedIds([]);
          toast.success('Selected data deleted Successfully', {
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
      console.error("Error deleting sales data:", error);
      alert("An error occurred while deleting sales data.");
    }

    handleCloseModal();
  };

  const handleSelectionModelChange = (newSelection) => {
    setSelectedIds(newSelection);
  };

  return (
    <>
      <div className="flex flex-grow ">
        <SideBar />

        <div
          className="flex-grow m-4 mb-20  "
          style={{ width: "80%", height: "80vh" }}
        >
          <div className="mb-5">
            <Link
              className="bg-blue-300 px-2 py-1 m-1 rounded-xl"
              to={"/sales/import"}
              variant="contained"
              color="primary"
            >
              Import Excel
            </Link>
            <button
              className="bg-red-500 px-2 py-1 m-1 rounded-xl text-white"
              onClick={handleDeleteClick}
            >
              Delete Selected
            </button>
          </div>
          <div className="h-full bg-gray-100 w-full">
            <DataGrid
              rows={processedUsers}
              columns={columns}
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
              onRowSelectionModelChange={handleSelectionModelChange}
              selectionModel={selectedIds}
              checkboxSelection
              disableRowSelectionOnClick
            />
          </div>
          <Dialog open={openModal} onClose={handleCloseModal}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete the selected users? This action
                cannot be undone.
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
}

export default SalesDataList;
