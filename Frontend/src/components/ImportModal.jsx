import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  Button,
  Grid,
  CircularProgress,
} from "@mui/material";
import { message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import SideBar from "../Layouts/SideBar";
import {FileContext} from "../context/FileContext"

const ImportModal = () => {
  const [selectedColumns, setSelectedColumns] = useState(["mobileno"]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [errorMessages, setErrorMessages] = useState([]);
  const { file, setFile } = useContext(FileContext)
  
  const allColumns = [
    "name",
    "customer_unique_code",
    "clinic_college_name",
    "designation",
    "department",
    "address",
    "mobileno",
    "whatsapp_availability",
    "alternative_mobile_no",
    "alternative_mobile_no2",
    "alternative_mobile_no3",
    "telephone",
    "drug_license_no",
    "gst",
    "email_id",
    "website",
    "city",
    "state",
    "country",
    "district",
    "pincode",
    "type",
    "source",
    "status",
    "enquiry",
    "last_purchased_date",
    "branch_data",
    "under_sales_person",
    "create_date",
    "age",
    "tags"
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

  };

  const handleColumnChange = (column) => {
    if (column === "mobileno") return;
    setSelectedColumns((prev) => prev.includes(column)
      ? prev.filter((col) => col !== column)
      : [...prev, column]
    );
  };

  const handleSelectAll = () => {
    if (selectedColumns.length === allColumns.length) {
      setSelectedColumns(["mobileno"]);
    } else {
      setSelectedColumns(allColumns);
    }
  };


  const handleUpload = () => {
    if (!file) {
      message.error("Please select a file to import");
      return;
    }

    setLoading(true);
    setErrorMessages([]);

    const formData = new FormData();
    const email =localStorage.getItem('email')
    formData.append("file", file);
    formData.append("email", email);
    formData.append("selectedColumns", JSON.stringify(selectedColumns));

    
    axios.post("/api/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((response) => {
        console.log("Upload successful:", response.data);
        message.success("Data imported successfully");
        navigate("/admin/view"); 
      })
      .catch((error) => {
        const errors = [];
        if (error.response && error.response.data) {
          const { message, duplicates, invalidHeaders } = error.response.data;
          if (message) errors.push(message);
          if (duplicates) errors.push(`Duplicates: ${duplicates.join(", ")}`);
          if (invalidHeaders) errors.push(`Invalid headers: ${invalidHeaders.join(", ")}`);
        }
        setErrorMessages(errors);
        message.error(errors.join(" | "));
      })
      .finally(() => {
        setLoading(false);
      });

    
  };

  return (
    <div className="flex gap-5  bg-gray-200">
      <SideBar />
      <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg max-w-3xl mx-auto mt-5 mb-20">
        <a className="text-blue-600 m-2 underline" href="/sampledata.xlsx" download="sampledata.xlsx">
          Download Sample File
        </a>
        <p className="text-red-500 mb-3">Note : Import is only possible for Excel(.xlsx) files</p>
        {/* <input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="block w-full max-w-md p-2 border border-gray-300 rounded-md mb-6"
        /> */}
         {file && (
          <p className="text-gray-700 font-semibold my-3">
            Selected File: {file.name}
          </p>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleSelectAll}
          className="mb-4"
        >
          {selectedColumns.length === allColumns.length ? "Unselect All" : "Select All"}
        </Button>

        <FormGroup className="w-full mb-2 ">
          <Grid container spacing={1}>
            {allColumns.map((col) => (
              <Grid item xs={12} sm={6} md={4} key={col}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedColumns.includes(col)}
                      onChange={() => handleColumnChange(col)}
                      disabled={col === "mobileno"}
                    />
                  }
                  label={col.replace(/_/g, " ")}
                />
              </Grid>
            ))}
          </Grid>
        </FormGroup>

      

        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          className="mt-4"
          disabled={loading}
        >
          {loading ? "Importing..." : "Upload"}
        </Button>

        {errorMessages.length > 0 && (
          <div className="mt-4 text-red-600">
            {errorMessages.map((error, index) => (
              <Typography key={index}>{error}</Typography>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportModal;
