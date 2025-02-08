import React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useLocation, useNavigate } from "react-router-dom";
import SideBar from "../Layouts/SideBar";
import { Checkbox, Box, Chip } from "@mui/material";
import columns from "../Layouts/columns";

const NullValuesTable = () => {
  const location = useLocation();
  const { filteredUsers, column } = location.state;
  const navigate = useNavigate();

  return (
    <div className="flex">
      <SideBar />
      <div
        className="flex-grow m-4  mb-12 "
        style={{ width: "70%", height: "86%" }}
      >
        <h1 className="text-2xl font-bold mb-4">
          Null/Empty Values for {column.replace(/_/g, " ")}
        </h1>
        <div style={{ height: "86vh", width: "100%" }}>
          <DataGrid
            rows={filteredUsers}
            rowHeight={35}
            columns={columns}
            slots={{ toolbar: GridToolbar }}
            pageSize={10}
            getRowId={(row) => row.sl_no}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default NullValuesTable;
