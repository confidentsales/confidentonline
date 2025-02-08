import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const [datas, setDatas] = useState([]);
  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await axios.get('/api/sales');
      setDatas(response.data);
      
    } catch (error) {
      console.error('Error fetching Sales Data:', error);
    }
  };

  const getSalesDataById = async (sl_no) => {
    try {
      const response = await axios.get(`/api/sales/${sl_no}`);
      setSelectedData(response.data);
      return response.data; // Return the user data
    } catch (error) {
      console.error('Error fetching Sales data:', error);
      return null; // Return null if there's an error
    }
  };

  const createSalesData = async (data) => {
    try {
      await axios.post('/api/sales', data);
      fetchSalesData();
    } catch (error) {
      console.error('Error creating Sales data:', error);
    }
  };

  const updateSalesData = async (sl_no, data) => {
    try {
      await axios.put(`/api/sales/${sl_no}`, data);
      fetchSalesData();
    } catch (error) {
      console.error('Error updating Sales data:', error);
    }
  };

  const deleteSalesData = async (sl_no) => {
    try {
      await axios.delete(`/api/sales/${sl_no}`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting sales data:', error);
    }
  };

  return (
    <SalesContext.Provider
      value={{ datas, selectedData, setSelectedData, fetchSalesData, getSalesDataById, createSalesData, updateSalesData, deleteSalesData }}
    >
      {children}
    </SalesContext.Provider>
  );
};

export default SalesProvider;


