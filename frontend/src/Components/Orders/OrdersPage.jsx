import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import "./OrdersPage.css";
import Swal from "sweetalert2";
import Cookies from 'js-cookie'

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const jwt_token=Cookies.get("jwt_token")

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const options={
        "method":"GET",
        "headers":{
          "Content-Type":"application/json",
          Authorization:`Bearer ${jwt_token}`
        }
      }
      const response = await fetch("http://localhost:5555/orders",options);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  
  return (
    <div className="orders-page">
      <Header />
      <h2 className="orders-title">All Orders</h2>

      {orders.length === 0 ? (
        <p className="no-orders">No orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>

              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <img src={item.image} alt={item.name} />
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <p><strong>Total:</strong> ₹{order.items.reduce((sum, i) => sum + i.price * i.quantity, 0)}</p>

              <div className="order-address">
                <p><strong>Address:</strong> {order.address.firstName} {order.address.lastName}, {order.address.city}, {order.address.pincode}</p>
                <p><strong>Phone:</strong> {order.address.phone}</p>
              </div>

              <div className="order-status">
                <p><strong>Status:</strong> {order.status}</p>
                
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
