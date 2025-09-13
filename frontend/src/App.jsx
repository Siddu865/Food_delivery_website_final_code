import React from "react";
import HomePage from "./Components/HomePage/HomePage.jsx";
import CartPage from "./Components/CartPage/CartPage.jsx";
import AdminPage from "./Components/AdminPage/AdminPage.jsx";
import AdminLoginPage from "./Components/AdminLoginPage/AdminLoginPage.jsx";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute.jsx";
import OrdersPage from "./Components/Orders/OrdersPage.jsx";
import { Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />

      <Route path="/admin-login" element={<AdminLoginPage />} />
    </Routes>
  );
};

export default App;
