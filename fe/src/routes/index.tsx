import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import Register from "../pages/Register/Register";
import ErrorPage404 from "../pages/ErrorPage404/ErrorPage404";
import Roles from "../pages/Roles/Roles";
import Resources from "../pages/Resources/Resources";
import Permission from "../pages/Permission/Permission";
import Branch from "../pages/Branch/Branch";
import Users from "../pages/User/User";
import Profile from "../pages/Profile/Profile";
import Customers from "../pages/Customer/Customer";
import CustomerSetting from "../pages/CustomerSettings/CustomerSetting";
import MembershipPlans from "../pages/Membership/MembershipPlans/MembershipPlans";
import MembershipAddons from "../pages/Membership/MembershipAddons/MembershipAddons";
import Transactions from "../pages/Membership/Transactions/Transactions";
import Invoice from "../pages/Invoice/Invoice";
import CustomerGridView from "../pages/Customer/CustomerGridView";
import Task from "../pages/Task/Task";
import Service from "../pages/Service/Service";
import Calendar from "../pages/Calendar/Calendar";
import CallHistory from "../pages/HistoryCall/HistoryCall";
import ProductReport from "../pages/Report/ProductReport/ProductReport";
import NotificationSettings from "../pages/NotificationSetting/NotificationSetting";
import LeadReports from "../pages/Report/LeadReport/LeadReport";
import PointHistory from "../pages/PointHistory/PointHistory";
import Product from "../pages/Product/Product";
import Voucher from "../pages/Voucher/Voucher";
import Unit from "../pages/Unit/Unit";
import CustomerSource from "../pages/CustomerSource/CustomerSource";
import Category from "../pages/Category/Category";

import AuthCheckerLayout from "../components/AuthCheckerLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/lead-reports" replace />,
  },
  {
    path: "/",
    element: <AuthCheckerLayout />,
    errorElement: <ErrorPage404 />,
    children: [
      { path: "roles-permissions", element: <Roles /> },
      { path: "permissions", element: <Permission /> },
      { path: "resources", element: <Resources /> },
      { path: "branch", element: <Branch /> },
      { path: "manager-users", element: <Users /> },
      { path: "profile-settings", element: <Profile /> },
      { path: "customers", element: <Customers /> },
      { path: "customers-grid", element: <CustomerGridView /> },
      { path: "customer-settings", element: <CustomerSetting /> },
      { path: "membership-plans", element: <MembershipPlans /> },
      { path: "membership-addons", element: <MembershipAddons /> },
      { path: "membership-transactions", element: <Transactions /> },
      { path: "invoice", element: <Invoice /> },
      { path: "task", element: <Task /> },
      { path: "service", element: <Service /> },
      { path: "notification-settings", element: <NotificationSettings /> },
      { path: "lead-reports", element: <LeadReports /> },
      { path: "calendar", element: <Calendar /> },
      { path: "call-history", element: <CallHistory /> },
      { path: "product-reports", element: <ProductReport /> },
      { path: "point-history", element: <PointHistory /> },
      { path: "product", element: <Product /> },
      { path: "voucher", element: <Voucher /> },
      { path: "unit", element: <Unit /> },
      { path: "customer-source", element: <CustomerSource /> },
      { path: "category", element: <Category /> },
    ],
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorPage404 />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
    errorElement: <ErrorPage404 />,
  },
  {
    path: "/register",
    element: <Register />,
    errorElement: <ErrorPage404 />,
  },
  {
    path: "*",
    element: <ErrorPage404 />,
  },
]);

export default router;
