import { useState, useEffect } from "react";
import { FaPlusCircle, FaListUl, FaShoppingCart } from "react-icons/fa";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "./AdminPage.css";

// Admin Panel Component
const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("add"); // default tab
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    description: "",
    category: "",
    price: "",
  });
  const [items, setItems] = useState([]); // food items list
  const [orders, setOrders] = useState([]); // orders list
  const navigate = useNavigate();
  const token = Cookies.get("admin_jwt");

  // Handle input changes for Add Item form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Add new item
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, image, description, category, price } = formData;

    if (!name || !image || !description || !category || !price) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "All fields are required!",
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:5555/fooditems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          image,
          description,
          category,
          price: Number(price),
        }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Item Added!",
          text: "Food item successfully added.",
        });
        setFormData({
          name: "",
          image: "",
          description: "",
          category: "",
          price: "",
        });
        fetchItems(); // refresh list
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to add item.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Could not connect to backend.",
      });
    }
  };

  // Fetch food items
  const fetchItems = async () => {
    try {
      const res = await fetch("http://localhost:5555/admin/listitems", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5555/admin/orders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Remove food item
  const handleRemoveItem = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This item will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`http://localhost:5555/fooditems/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            setItems(items.filter((item) => item._id !== id));
            Swal.fire("Deleted!", "Food item has been deleted.", "success");
          }
        } catch (err) {
          Swal.fire("Error", "Failed to delete item.", "error");
        }
      }
    });
  };

  // Update order status
  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5555/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders(
          orders.map((order) =>
            order._id === id ? { ...order, status } : order
          )
        );
        Swal.fire("Updated!", "Order status updated.", "success");
      }
    } catch (err) {
      Swal.fire("Error", "Failed to update order status.", "error");
    }
  };

  // Cancel order
  const handleCancelOrder = async (id) => {
    Swal.fire({
      title: "Cancel this order?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`http://localhost:5555/orders/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            setOrders(orders.filter((order) => order._id !== id));
            Swal.fire("Canceled!", "Order has been canceled.", "success");
          }
        } catch (err) {
          Swal.fire("Error", "Failed to cancel order.", "error");
        }
      }
    });
  };

  // Logout handler
  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of the admin panel.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        Cookies.remove("admin_jwt");
        Swal.fire(
          "Logged Out!",
          "You have been successfully logged out.",
          "success"
        );
        navigate("/admin-login");
      }
    });
  };

  // Fetch data when switching tabs
  useEffect(() => {
    if (activeTab === "list") fetchItems();
    if (activeTab === "orders") fetchOrders();
  }, [activeTab]);

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Admin Panel</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Navigation */}
      <div className="admin-nav">
        <button
          onClick={() => setActiveTab("add")}
          className={activeTab === "add" ? "active" : ""}
        >
          <FaPlusCircle /> Add Items
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={activeTab === "list" ? "active" : ""}
        >
          <FaListUl /> List Items
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={activeTab === "orders" ? "active" : ""}
        >
          <FaShoppingCart /> Orders
        </button>
      </div>

      {/* Add Items */}
      {activeTab === "add" && (
        <form onSubmit={handleSubmit} className="admin-form">
          <h2>Add New Item</h2>
          <label>Image URL</label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="Enter image URL"
          />
          <label>Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
          />
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
          />
          <label>Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Enter category"
          />
          <label>Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Enter price"
          />
          <button type="submit" className="add-btn">
            Add Item
          </button>
        </form>
      )}

      {/* List Items */}
      {activeTab === "list" && (
        <div className="list-items">
          <h2>All Food Items</h2>
          {items.length === 0 ? (
            <p>No items found.</p>
          ) : (
            <div className="items-grid">
              {items.map((item) => (
                <div key={item._id} className="item-card">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="list-image"
                  />
                  <h3>{item.name}</h3>
                  <p>{item.category}</p>
                  <p>₹{item.price}</p>
                  <button
                    onClick={() => handleRemoveItem(item._id)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders */}
      {activeTab === "orders" && (
        <div className="orders">
          <h2>Customer Orders</h2>
          {orders.length === 0 ? (
            <p>No orders placed.</p>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
                  <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>

                  {/* Items */}
                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <img src={item.image} alt={item.name} />
                        <span>{item.name} × {item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Address */}
                  <div className="order-address">
                    <p><strong>Customer:</strong> {order.address.firstName} {order.address.lastName}</p>
                    <p><strong>City:</strong> {order.address.city}</p>
                    <p><strong>Pincode:</strong> {order.address.pincode}</p>
                    <p><strong>Phone:</strong> {order.address.phone}</p>
                  </div>

                  {/* Status + Actions */}
                  <div className="order-actions">
                    <h3>Select status: </h3>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                    >
                      <option value="order in process">Order in Process</option>
                      <option value="out for delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                    </select>
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="remove-btn"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
