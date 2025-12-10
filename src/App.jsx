import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Store from "./pages/Store";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import UserLogin from "./pages/UserLogin";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import Payments from "./pages/admin/Payments";
import Metrics from "./pages/admin/Metrics";
import UserDashboard from "./pages/user/Dashboard";
import UserProtectedRoute from "./components/UserProtectedRoute";
import OrderConfirmation from "./pages/OrderConfirmation";

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <Layout currentPageName="Home">
            <Home />
          </Layout>
        }
      />
      <Route
        path="/store"
        element={
          <Layout currentPageName="Store">
            <Store />
          </Layout>
        }
      />
      <Route
        path="/product"
        element={
          <Layout currentPageName="ProductDetails">
            <ProductDetails />
          </Layout>
        }
      />

      {/* User Routes */}
      <Route path="/user/login" element={<UserLogin />} />
      <Route
        path="/user/dashboard"
        element={
          <UserProtectedRoute>
            <UserDashboard />
          </UserProtectedRoute>
        }
      />

      <Route path="/order-confirmation" element={<OrderConfirmation />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Products />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Orders />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Payments />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/metrics"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Metrics />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
