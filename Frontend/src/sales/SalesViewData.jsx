import React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useLocation, useNavigate } from "react-router-dom";
import SideBar from "../Layouts/SideBar";
import { Checkbox, Box, Chip } from "@mui/material";

const SalesViewData = () => {
  const location = useLocation();
  const { filteredUsers, column } = location.state;
  const navigate = useNavigate();
  const columns = [
    {
      field: "sales_person",
      headerName: "Sales Person",
      width: 120,
      renderHeader: () => <div className="text-base font-semibold ">Sales Person</div>,
    },
    {
      field: "voucher_name",
      headerName: "Voucher Number",
      width: 150,
      renderHeader: () => <div className="text-base font-semibold">Voucher Name</div>,
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
      renderHeader: () => (
        <div className="text-base font-semibold">Date</div>
      ),
      renderCell: (params) => {
        if (!params.value) {
            return " "; 
        }
    
        const date = new Date(params.value);
        if (isNaN(date)) {
            return " "; 
        }
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleString("en-IN", options);
    },
    
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
      renderHeader: () => <div className="text-base font-semibold">Party Alias</div>,
    },
    {
      field: "party_ledger_parent",
      headerName: "Party Ledger Parent",
      width: 150,
      renderHeader: () => <div className="text-base font-semibold">Party Ledger Parent</div>,
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
      renderHeader: () => <div className="text-base font-semibold">Brand (Item Group)</div>,
    },
    {
      field: "item_confident_group",
      headerName: "Item Confident Group",
      width: 200,
      renderHeader: () => <div className="text-base font-semibold">Item Confident Group</div>,
    },
    {
      field: "godown",
      headerName: "Godown",
      width: 200,
      renderHeader: () => (
        <div className="text-base font-semibold">Godown</div>
      ),
    },
    {
      field: "item_batch",
      headerName: "Item Batch",
      width: 150,
      renderHeader: () => <div className="text-base font-semibold">Item Batch</div>,
    },
    {
      field: "actual_quantity",
      headerName: "Acutal Quantity",
      width: 150,
      renderHeader: () => <div className="text-base font-semibold">Acutal Quantity</div>,
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
      renderHeader: () => <div className="text-base font-semibold">Discount</div>,
    },
    {
      field: "discount_amount",
      headerName: "Discount Amount",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Discount Amount</div>
      )
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 150,
      renderHeader: () => (
        <div className="text-base font-semibold">Amount</div>
      ),
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
      renderCell: (params) => {
        const date = new Date(params.value);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleString("en-IN",options) || "N/A";
      },
    },
  ];

  return (
    <div className="flex">
      <SideBar />
      <div
        className="flex-grow m-4  mb-12 "
        style={{ width: "70%", height: "86%" }}
      >
        <h1 className="text-2xl font-bold mb-4">
          Values for {column.replace(/_/g, " ")}
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

export default SalesViewData;

