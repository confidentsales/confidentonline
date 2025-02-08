import React, { useState, useEffect } from "react";
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

const ImportModal = () => {
  const [file, setFile] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // Progress state
  const navigate = useNavigate();
  const [errorMessages, setErrorMessages] = useState([]);

  const allColumns = [
    "sales_person",
    "voucher_number",
    "reference",
    "date",
    "voucher_type",
    "party_name",
    "party_state",
    "district",
    "party_alias",
    "party_ledger_parent",
    "gst_number",
    "item_name",
    "item_alias",
    "item_hsncode",
    "item_part_no",
    "brand",
    "item_confident_group",
    "godown",
    "item_batch",
    "actual_quantity",
    "billed_quantity",
    "alternate_actual_quantity",
    "alternate_billed_quantity",
    "rate",
    "unit",
    "discount",
    "discount_amount",
    "amount",
    "sales_ledger",
    "narration",
    "offer_type"
  ];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
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

  const fetchImportProgress = async () => {
    try {
      const response = await axios.get("/api/import/progress");
      setProgress(response.data.progress);
    } catch (error) {
      console.error("Error fetching import progress:", error);
    }
  };

  const handleUpload = () => {
    if (!file) {
      message.error("Please select a file to import");
      return;
    }

    setLoading(true);
    setProgress(0); // Reset progress
    setErrorMessages([]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("username", localStorage.getItem("username"));
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

    // Poll for import progress
    const intervalId = setInterval(() => {
      fetchImportProgress();
      if (progress >= 100) clearInterval(intervalId);
    }, 1000);
  };

  return (
    <div className="flex gap-5  bg-gray-200">
      <SideBar />
      <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg max-w-3xl mx-auto mt-5 mb-20">
        <a className="text-blue-600 m-2 underline" href="/sampledata.xlsx" download="sampledata.xlsx">
          Download Sample File
        </a>
        <p className="text-red-500 mb-3">Note : Import is only possible for Excel(.xlsx) files</p>
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="block w-full max-w-md p-2 border border-gray-300 rounded-md mb-6"
        />

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

        {loading && (
          <div className="flex items-center gap-4">
            <CircularProgress variant="determinate" value={progress} />
            <Typography>{progress}%</Typography>
          </div>
        )}

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
