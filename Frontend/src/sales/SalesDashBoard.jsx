import React, { useState, useContext, useEffect } from "react";
import { SalesContext } from "../context/SalesContext";
import { useLocation, useNavigate } from "react-router-dom";
import SideBar from "../Layouts/SideBar";

const columns = [
  "sales_person",
  "party_name",
  "party_state",
  "party_ledger_parent",
  "item_name",
  "brand",
  "item_confident_group",
  "offer_type",
];

function SalesDashBoard() {
  const { datas, fetchSalesData } = useContext(SalesContext);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  const getValueCounts = (column) => {
    const valueCounts = {}; // To store sum of amounts or counts per value
    const quantityCounts = {}; // To store quantity per value
    const occurrenceCounts = {}; // To store occurrences per value
    let nullCount = 0;

    datas.forEach((user) => {
      const value = user[column];
      const amount = parseFloat(user.amount) || 0;
      const quantity = parseInt(user.quantity) || 0;

      if (value === null || value === "") {
        nullCount += 1;
      } else {
        // Sum amounts and quantities for each value
        valueCounts[value] = (valueCounts[value] || 0) + amount;
        quantityCounts[value] = (quantityCounts[value] || 0) + quantity;

        // Track how many times each value occurs
        occurrenceCounts[value] = (occurrenceCounts[value] || 0) + 1;
      }
    });

    // Format the amounts to two decimal places for appropriate columns
    for (const key in valueCounts) {
      if (
        [
          "party_name",
          "party_state",
          "sales_person",
          "party_ledger_parent",
          "item_name",
          "brand",
          "item_confident_group",
        ].includes(column)
      ) {
        valueCounts[key] = valueCounts[key].toFixed(2); // Format to 2 decimal places
      }
    }

    return { valueCounts, quantityCounts, occurrenceCounts, nullCount };
  };

  useEffect(() => {
    const hasReload = sessionStorage.getItem("hasReload");
    if (!hasReload) {
      sessionStorage.setItem("hasReload", "true");
      window.location.reload();
    }
  }, []);

  const getTopValues = (valueCounts) => {
    return Object.entries(valueCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  };

  const handleColumnClick = (column) => {
    setSelectedColumn(column);
  };

  const handleCloseModal = () => {
    setSelectedColumn(null);
  };

  const handleSeeNullValues = () => {
    const filteredUsers = datas.filter(
      (user) => !user[selectedColumn] || user[selectedColumn] === ""
    );
    navigate("/sales/dashboard/null-values", {
      state: { filteredUsers, column: selectedColumn },
    });
  };

  const handleSeeValues = () => {
    const filteredUsers = datas.filter(
      (user) => user[selectedColumn] || user[selectedColumn] === ""
    );
    navigate("/sales/dashboard/values", {
      state: { filteredUsers, column: selectedColumn },
    });
  };

  const { valueCounts, quantityCounts, occurrenceCounts, nullCount } =
    selectedColumn
      ? getValueCounts(selectedColumn)
      : {
          valueCounts: {},
          quantityCounts: {},
          occurrenceCounts: {},
          nullCount: 0,
        };
  const topValues = selectedColumn ? getTopValues(valueCounts) : [];

  return (
    <div className="flex flex-grow">
      <SideBar />
      <div className="ml-20 mt-12 w-full">
        <h1 className="text-3xl font-bold mb-6">Data Overview</h1>
        <h1 className="text-xl font-bold ml-5 md-5">
          Total No of fields: {datas.length}
        </h1>
        <div className="mr-2w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mr-5 mb-5">
          {columns.map((column) => {
            const columnData = getValueCounts(column); // Get value counts for each column
            const topColumnValues = getTopValues(columnData.valueCounts); // Get top 5 values based on count

            return (
              <div
                key={column}
                className="p-4 rounded-lg shadow-md text-black cursor-pointer hover:bg-gray-100 transition-colors bg-gray-200"
                onClick={() => handleColumnClick(column)}
              >
                <h2 className="text-lg font-semibold mb-2 capitalize">
                  {column.replace(/_/g, " ")}
                </h2>

                {/* Display top values as a list */}
                <ul className="mb-2 flex flex-col justify-around gap-2">
                  {topColumnValues.length > 0 ? (
                    topColumnValues.map(([value, count], index) => (
                      <li key={index} className="text-gray-600">
                        {value}          :            {"     "}
                        {[
                          "party_name",
                          "party_state",
                          "sales_person",
                          "party_ledger_parent",
                          "item_name",
                          "brand",
                          "item_confident_group",
                          "offer_type",
                        ].includes(column)
                          ? `${count}`
                          : count}{" "}
                        <br />
                       
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-600">No data</li>
                  )}
                </ul>

                <p className="text-blue-600 font-medium underline">
                  Click to view details
                </p>
              </div>
            );
          })}
        </div>

        {selectedColumn && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl relative">
              <h2 className="text-xl font-bold mb-4">
                Data for {selectedColumn.replace(/_/g, " ")}
              </h2>
              <ul className="list-disc ml-5 mb-4 max-h-60 overflow-y-auto gap-10">
                {/* Sorting the entries by count in descending order */}
                <div className="flex flex-row justify-between">
                  <div className="text-lg py-2 m-2">Value</div>
                  <div className="text-lg py-2 m-2">(Total)</div>
                  <div className="text-lg py-2 m-2">Quantity</div>
                </div>

                {/* Sort the entries by valueCounts (descending order) */}
                {Object.entries(valueCounts)
                  .sort(([, a], [, b]) => b - a) // Sort by count (descending)
                  .map(([value, count], index) => (
                    <li key={index} className="mb-2">
                      <div className="flex flex-row justify-between gap-10">
                        <div className="my-2 w-44">{value}</div>
                        <div className="mr-48">
                          {[
                            "party_name",
                            "party_state",
                            "sales_person",
                            "party_ledger_parent",
                            "item_name",
                            "brand",
                            "item_confident_group",
                            "offer_type",
                          ].includes(selectedColumn)
                            ? `${count}`
                            : count}
                        </div>
                        <div className="mr-2">
                          {occurrenceCounts[value] || 0}
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>

              <p className="text-black font-semibold mb-4">
                Total Null/Empty Values: {nullCount}
              </p>
              <button
                onClick={handleCloseModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              >
                &times;
              </button>
              <div className="flex flex-row items-center justify-evenly gap-10 w-full">
              <button
                onClick={handleSeeValues}
                className="bg-gray-700 p-2 text-white font-medium rounded-lg mt-5 w-60"
              >
                See Values in Table
              </button>
              <button
                onClick={handleSeeNullValues}
                className="bg-gray-700 p-2 text-white font-medium rounded-lg mt-5 w-60"
              >
                See Null Values in Table
              </button>
             
              </div>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SalesDashBoard;
