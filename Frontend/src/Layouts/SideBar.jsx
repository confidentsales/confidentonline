import React, { useState, useEffect } from "react";
import { FaUser, FaChartLine, FaShoppingCart } from "react-icons/fa";
import { MdProductionQuantityLimits, MdSpaceDashboard } from "react-icons/md";
import { TbLogs } from "react-icons/tb";
import { RxDropdownMenu } from "react-icons/rx";
import { Button, Menu } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import "../sidebar.css";
import { LuDatabaseBackup } from "react-icons/lu";
import { SiTestcafe } from "react-icons/si";

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [username, setUsername] = useState("");
  const [loginType, setLoginType] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // New state for admin check

  useEffect(() => {
    const storedLoginType = localStorage.getItem("loginType");
    if (storedLoginType) {
      setLoginType(storedLoginType);
      // Check if the username is "admin"
      if (storedLoginType === "admin") {
        setIsAdmin(true);
      }
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1085) {
        setCollapsed(true); // Collapse for md and sm screens
      } else {
        setCollapsed(false); // Expand for larger screens
      }
    };

    handleResize(); // Check initial screen size
    window.addEventListener("resize", handleResize); // Add resize event listener

    return () => {
      window.removeEventListener("resize", handleResize); // Clean up event listener
    };
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const items = [
    {
      key: "1",
      icon: <MdSpaceDashboard />,
      label: "Dashboard",
      children: [
        {
          key: "1-1",
          label: <Link to="/admin/dashboard">User Dashboard</Link>,
        },
        {
          key: "1-2",
          label: <Link to="/sales/dashboard">Sales Dashboard</Link>,
        },
      ],
    },
    {
      key: "2",
      icon: <FaUser />,
      label: "User Data",
      children: [
        { key: "2-1", label: <Link to="/admin/view">View Data</Link> },
        { key: "2-2", label: <Link to="/admin/test-data">Test & Import Data</Link> },
        { key: "2-3", label: <Link to="/admin/create">Create Data</Link> },
      ],
    },
    {
      key: "3",
      icon: <FaChartLine />,
      label: "Sales Data",
      children: [
        { key: "3-1", label: <Link to="/sales/view">View Data</Link> },
        { key: "3-2", label: <Link to="/sales/import">Import Data</Link> },
        // { key: "3-3", label: <Link to="/sales/create">Create Data</Link> },
      ],
    },
    // {
    //   key: "4",
    //   icon: <FaShoppingCart />,
    //   label: "Purchase Data",
    //   children: [
    //     { key: "4-1", label: <Link to="#view-purchase-data">View Data</Link> },
    //     {
    //       key: "4-2",
    //       label: <Link to="#import-purchase-data">Import Data</Link>,
    //     },
    //     {
    //       key: "4-3",
    //       label: <Link to="#create-purchase-data">Create Data</Link>,
    //     },
    //   ],
    // },
    // {
    //   key: "5",
    //   icon: <MdProductionQuantityLimits />,
    //   label: "Product Data",
    //   children: [
    //     { key: "5-1", label: <Link to="#view-product-data">View Data</Link> },
    //     {
    //       key: "5-2",
    //       label: <Link to="#import-product-data">Import Data</Link>,
    //     },
    //     {
    //       key: "5-3",
    //       label: <Link to="#create-product-data">Create Data</Link>,
    //     },
    //   ],
    // },
    {
      key: "6",
      icon: <TbLogs />,
      label: "Logs",
      children: [
        { key: "6-1", label: <Link to="/admin/logs">User Logs</Link> },
        {
          key: "6-2",
          label: <Link to="/sales/logs">Sales Logs</Link>,
        },
      ],
    },
    {
      key: "7",
      icon: <RxDropdownMenu />,
      label: <Link to="/admin/manage-options">Manage Dropdown Options</Link>,
    },
    ...(isAdmin
      ? [
          {
            // Only include if username is "admin"
            key: "8",
            icon: <LuDatabaseBackup />,
            label: <Link to="/admin/backup-restore">Backup/Restore</Link>,
          },
        ]
      : []),
    // {
    //   key: "9",
    //   icon: <SiTestcafe />,
    //   label:<Link to="/admin/test-data">Test Data</Link>,
    // },
  ];

  return (
    <div className="flex max-w-full">
      <div
        style={{ width: collapsed ? 80 : 200 }}
        className="md:w-40 bg-gray-800 text-white transition-width duration-300 "
      >
        {!collapsed && (
          <Button
            type="primary"
            onClick={toggleCollapsed}
            className="m-2 bg-gray-700"
            style={{ marginBottom: 16 }}
          >
            <MenuFoldOutlined />
            Close
          </Button>
        )}
        {collapsed && (
          <Button
            type="primary"
            onClick={toggleCollapsed}
            className="flex flex-col m-2 bg-gray-700 "
            style={{ marginBottom: 16 }}
          >
            <MenuUnfoldOutlined />
          </Button>
        )}
        <Menu
          mode="inline"
          theme="dark"
          inlineCollapsed={collapsed}
          items={items}
          className="custom-menu"
        />
      </div>
    </div>
  );
};

export default SideBar;
