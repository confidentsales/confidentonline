import React, { useCallback, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { UserProvider } from "./components/UserContext";
import UserForm from "./components/UserForm";
import UserList from "./components/UserList";
import Layout from "./Layouts/Layout";
import AdminPage from "./pages/AdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import ProtectedRoute from "./ProtectedRoute";
import Logout from "./Layouts/Logout";
import CreateUser from "./components/CreateUser";
import ImportModal from "./components/ImportModal";
import LogsTable from "./components/LogsTable";
import DashBoard from "./components/DashBoard";
import CreateNewUser from "./components/CreateNewUser";
import ManageDropDown from "./components/ManageDropDown";
import { DropdownProvider } from "./DropdownContext";
import NullValuesTable from "./components/NullValuesTable";
import BackupRestore from "./components/BackupRestore";
import HandleUsers from "./components/HandleUsers";
import ForgotPassword from "./components/ForgotPassword";
import TestData from "./components/TestData";
import DeletedData from "./components/DeletedData";
import UserForgotPassword from "./components/UserForgotPassword";
import FloatingRedirect from "./Layouts/FloatingRedirect";
import LoadingOverlay from "./Layouts/LoadingOverlay";
import HomePage from "./pages/HomePage";
// import { checkTokenOnLoad, setupInactivityListeners } from './utils/inactivityLogout';
import InactivityLogout from "./utils/inactivityLogout";
import SalesPage from "./pages/SalesPage.jsx";
import SalesImportModal from "./sales/SalesImportModal.jsx";
import CreateSalesData from "./sales/CreateSalesData.jsx";
import SalesTestData from "./sales/SalesTestData.jsx";
import SalesDashBoard from "./sales/SalesDashBoard.jsx";
import SalesDataList from "./sales/SalesDataList.jsx";
import SalesLogsTable from "./sales/SalesLogsTable.jsx";
import SalesUpdateUser from "./sales/SalesUpdateUser.jsx";
import SalesProvider from "./context/SalesContext.jsx";
import SalesNullValuesTable from "./sales/SalesNullValuesTable.jsx";
import SalesViewData from "./sales/SalesViewData.jsx";
import UserValuesTable from "./components/UserValuesTable.jsx";
import { FileProvider } from "./context/FileContext.jsx";

const App = () => {
  const loginType = localStorage.getItem("loginType");

  return (
    <FileProvider>
      <UserProvider>
        <SalesProvider>
          <DropdownProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/login" />} />

                <Route path="/login" element={<AdminLoginPage />} />

                {loginType === "admin" && (
                  <>
                    <Route
                      path="admin/logout/handle-users"
                      element={
                        <ProtectedRoute>
                          <HandleUsers />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/backup-restore"
                      element={
                        <ProtectedRoute>
                          <BackupRestore />
                        </ProtectedRoute>
                      }
                    />
                   
                    <Route
                      path="/admin/backup-restore/deleted-data"
                      element={
                        <ProtectedRoute>
                          <DeletedData />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="admin/logout/new_user"
                      element={
                        <ProtectedRoute>
                          <CreateNewUser />
                        </ProtectedRoute>
                      }
                    />
                    {/* More admin routes */}
                  </>
                )}

                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="home/sales"
                  element={
                    <ProtectedRoute>
                      <SalesPage />
                    </ProtectedRoute>
                  }
                />

                {/* <Route
                path="/sales/test-data"
                element={
                  <ProtectedRoute>
                    <SalesTestData />
                  </ProtectedRoute>
                }
              /> */}

                <Route
                  path="/sales/:sl_no"
                  element={
                    <ProtectedRoute>
                      <SalesUpdateUser />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/sales/view"
                  element={
                    <ProtectedRoute>
                      <SalesDataList />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/sales/import"
                  element={
                    <ProtectedRoute>
                      <SalesImportModal />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/sales/dashboard"
                  element={
                    <ProtectedRoute>
                      <SalesDashBoard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/sales/dashboard/null-values"
                  element={
                    <ProtectedRoute>
                      <SalesNullValuesTable />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/sales/dashboard/values"
                  element={
                    <ProtectedRoute>
                      <SalesViewData />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/sales/create"
                  element={
                    <ProtectedRoute>
                      <CreateSalesData />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/sales/logs"
                  element={
                    <ProtectedRoute>
                      <SalesLogsTable />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="admin/logout"
                  element={
                    <ProtectedRoute>
                      <Logout />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/create"
                  element={
                    <ProtectedRoute>
                      <CreateUser />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/view"
                  element={
                    <ProtectedRoute>
                      <UserList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/import"
                  element={
                    <ProtectedRoute>
                      <ImportModal />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/test-data"
                  element={
                    <ProtectedRoute>
                      <TestData />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashBoard />
                    </ProtectedRoute>
                  }
                />

                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/user-forgot-password"
                  element={<UserForgotPassword />}
                />

                <Route
                  path="/admin/dashboard/null-values"
                  element={
                    <ProtectedRoute>
                      <NullValuesTable />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/dashboard/values"
                  element={
                    <ProtectedRoute>
                      <UserValuesTable />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/manage-options"
                  element={
                    <ProtectedRoute>
                      <ManageDropDown />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/users/new"
                  element={
                    <ProtectedRoute>
                      <UserForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users/:sl_no"
                  element={
                    <ProtectedRoute>
                      <UserForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/logs"
                  element={
                    <ProtectedRoute>
                      <LogsTable />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/backup"
                  element={
                    <ProtectedRoute>
                      <BackupRestore />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="*"
                  element={
                    <ProtectedRoute>
                      <div className="text-3xl text-red-500 text-center mt-36">
                        Page not Found !
                      </div>
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
            {/* <LoadingOverlay/> */}
            <FloatingRedirect />
            <InactivityLogout />
          </DropdownProvider>
        </SalesProvider>
      </UserProvider>
    </FileProvider>
  );
};

export default App;
