import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import SideBar from "../Layouts/SideBar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import 'react-toastify/dist/ReactToastify.css';
import columns from "../Layouts/columns";


const ManageDropdownsPage = () => {
  const [dropdowns, setDropdowns] = useState({
    state: [],
    type: [],
    designation: [],
    department :[] ,
    status: [],
    whatsapp_availability:[],
    under_sales_person: [],
    age:[],
    city: [],
    source:[],
    enquiry:[],
    branch_data:[],
    tags: [],
  });

  const [newValue, setNewValue] = useState("");
  const [selectedDropdown, setSelectedDropdown] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");   const navigate = useNavigate();

  // Fetch dropdown values from the backend
  const fetchDropdownValues = async () => {
    try {
      const response = await axios.get("/api/dropdown");
      setDropdowns(response.data);
    } catch (error) {
      console.error("Failed to fetch dropdown values:", error.message);
    }
  };

  useEffect(() => {
    fetchDropdownValues();
  }, []);

  // Validation function
 // Validation function
const isValidValue = (value) => {
  // Check for all characters or all digits being the same
  const allSameCharsOrDigits = /^([a-zA-Z0-9])\1+$/;
  
  // Check if the value contains only numeric characters
  const onlyNumbers = /^\d+$/;

  // Ensure the value is not all the same character/digit and is not purely numeric
  return !allSameCharsOrDigits.test(value) && !onlyNumbers.test(value);
};


  // Handle adding a new value to a dropdown
  const handleAddValue = async () => {
    if (!newValue.trim()) {
      setError("Value is required");
      return;
    }

    if (!isValidValue(newValue)) {
      setError("Value must not contain repeated characters or numeric values");
      return;
    }

    try {
      const response = await axios.post("/api/dropdown", {
        dropdown_type: selectedDropdown,
        value: newValue,
      });

      if (response.status === 201) {
        setDropdowns((prev) => ({
          ...prev,
          [selectedDropdown]: [...prev[selectedDropdown], newValue],
        }));
        setNewValue("");
        setOpenDialog(false);
        setError(""); // Clear any existing errors
        setSuccess("Value added successfully!");
      }
    } catch (error) {
      console.error("Failed to add new value:", error.message);
      setError("Value Already exist in this field.");
      setSuccess(""); // Clear success message if there's an error
    }
  };

  // Handle deleting a value from a dropdown
  const handleDeleteValue = async (dropdown, value) => {
    try {
      const response = await axios.delete("/api/dropdown", {
        data: {
          dropdown_type: dropdown,
          value: value,
        },
      });

      if (response.status === 200) {
        setDropdowns((prev) => ({
          ...prev,
          [dropdown]: prev[dropdown].filter((item) => item !== value),
        }));
      }
    } catch (error) {
      console.error("Failed to delete value:", error.message);

    }
  };

  const handleOpenDialog = (dropdown) => {
    setSelectedDropdown(dropdown);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(""); 
  };

  const handleSubmit = () => {
    navigate("/admin/create");
  };

  return (
    <div className="flex flex-grow bg-gray-200" >
      <SideBar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Manage Dropdowns
        </Typography>
        <Grid container spacing={4}>
          {Object.keys(dropdowns).map((key) => (
            <Grid item xs={12} sm={6} md={3} key={key}>
              <Card>
                <CardContent>
                  <Typography variant="h7" gutterBottom>
                    {key.replace(/_/g, " ").toUpperCase()}
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>
                    {/* {key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())} */}
                    </InputLabel>
                    <Select
                      value=""
                      onChange={() => {}} // Placeholder to display the dropdown
                    >
                      {dropdowns[key].map((option, index) => (
                        <MenuItem key={index} value={option}>
                          {option}
                          <Button
                            onClick={() => handleDeleteValue(key, option)}
                            variant="text"
                            size="small"
                            sx={{ ml: 1 }}
                          >
                            X
                          </Button>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={() => handleOpenDialog(key)}
                  >
                    Add Values 
                    {/* to {key.replace(/_/g, " ")} */}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{ mt: 4 }}
        >
          Submit and Go to Create User
        </Button>

        {/* Dialog for adding new value */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Add New Value</DialogTitle>
          <DialogContent>
            <TextField
              label="New Value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              fullWidth
              margin="normal"
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleAddValue}
              variant="contained"
              color="primary"
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
};

export default ManageDropdownsPage;
