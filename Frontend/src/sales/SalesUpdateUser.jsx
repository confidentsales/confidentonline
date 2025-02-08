import React, { useState, useEffect, useContext } from "react";
import { SalesContext } from "../context/SalesContext";
import { useParams, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Checkbox,
  ListItemText,
  Chip,
} from "@mui/material";
import axios from "axios";
import SideBar from "../Layouts/SideBar";

const UserForm = () => {
  const { sl_no } = useParams();
  const {updateSalesData , deleteSalesData} = useContext(SalesContext);
  const navigate = useNavigate();
  const [error, setError] = useState({});
  const [openDialog, setOpenDialog] = useState(false);

  const [user, setUser] = useState({
    sales_person: "",
    voucher_number: "",
    reference: "",
    date: "",
    voucher_type: "",
    party_name: "",
    party_state: "",
    district: "",
    party_alias: "",
    party_ledger_parent: "",
    gst_number: "",
    item_name: "",
    item_alias: "",
    item_hsncode: "",
    item_part_no: "",
    brand: "",
    item_confident_group: "",
    godown: "",
    item_batch: "",
    actual_quantity: "",
    billed_quantity: "",
    alternate_actual_quantity: "",
    alternate_billed_quantity: "",
    rate: "",
    unit: "",
    discount: "",
    discount_amount: "",
    amount: "",
    sales_ledger: "",
    narration: "",
    offer_type: "",
    last_update_date:""
  });

  const disabledKeys = ["last_updated_date", "sl_no"];
  const [originalUser, setOriginalUser] = useState({ ...user });


  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is zero-based
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    if (sl_no) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(`/api/sales/${sl_no}`);
          const fetchedUser = response.data;

          // Ensure enquiry and tags are arrays
          const formattedUser = {
            ...fetchedUser,
            date:formatDate(fetchedUser.date),
            last_updated_date: formatDate(fetchedUser.last_updated_date),
          };

          setUser(formattedUser);
          setOriginalUser(formattedUser); // Set originalUser here
        } catch (error) {
          console.error("Error fetching user:", error.message);
        }
      };

      fetchUser();
    }
  }, [sl_no]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for changes using deepEqual function
    if (deepEqual(user, originalUser)) {
      alert("No changes detected. Please modify fields to update.");
      return;
    }

    const { last_updated_date, ...userData } = user;

    try {
      await updateSalesData(sl_no, userData);
      alert("Data updated successfully");
      navigate("/sales/view");
    } catch (error) {
      console.error("Error updating user:", error.message);
      alert("Failed to update user.");
    }
  };

  const deepEqual = (obj1, obj2) => {
    // Check if both are the same object
    if (obj1 === obj2) return true;

    // Check if both are objects
    if (
      typeof obj1 !== "object" ||
      typeof obj2 !== "object" ||
      obj1 == null ||
      obj2 == null
    ) {
      return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    // Compare keys and values
    for (let key of keys1) {
      if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }
    return true;
  };

  
  const handleDelete = () => {
    setOpenDialog(true);
  };

  const confirmDelete = async () => {
    await deleteSalesData(sl_no);
    alert("Data deleted successfully");
    setOpenDialog(false);
    navigate("/sales/view");
  };

  return (
    <>
      <div className="flex flex-grow">
        <SideBar />
        <div className="flex flex-row flex-grow w-full">
          <div className="w-full m-4">
            <p className="ml-10 m-4 font-bold lg:text-3xl">
              Update User
            </p>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(user).map(([key, value], index) => (
                  <div key={index} className="flex flex-col">
                    <label className="mb-1 text-gray-600" htmlFor={key} >
                      {key.toUpperCase()}
                    </label>
                    <input
                      id={key}
                      name={key}
                      disabled={disabledKeys.includes(key)}
                      value={value || ""} // Set the current value
                      onChange={(e) =>
                        setUser({ ...user, [key]: e.target.value })
                      }
                      className="border border-black p-4 rounded-md h-14"
                    />
                  </div>
                ))}
              </div>
              <button
                className="mt-6 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserForm;
