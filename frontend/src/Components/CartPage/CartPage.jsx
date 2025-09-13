// CartPage.js
import React, { useState, useEffect } from "react";
import Header from "../Header/Header";
import Swal from "sweetalert2";
import "./CartPage.css";
import Cookies from "js-cookie";

/**
 * This CartPage:
 * - Loads cart from backend (JWT required)
 * - Mirrors counts to localStorage (for faster UI across the app)
 * - Removes items from both backend + localStorage
 * - On confirm order, posts to /orders, then clears backend cart + localStorage
 */

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    city: "",
    pincode: "",
    phone: "",
  });

  const jwt_token = Cookies.get("jwt_token");

  // Fetch cart from backend on mount / when token changes
  useEffect(() => {
    const fetchCart = async () => {
      if (!jwt_token) {
        setCartItems([]);
        return;
      }
      try {
        const res = await fetch("http://localhost:5555/cart", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt_token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json(); // [{ foodId: {...}, count }]
        const mapped = data.map((item) => ({
          key: item.foodId._id,
          count: item.count,
          name: item.foodId.name,
          image: item.foodId.image,
          price: item.foodId.price,
          description: item.foodId.description,
          category: item.foodId.category,
        }));
        setCartItems(mapped);

        // hydrate localStorage counts for other components
        mapped.forEach((i) => {
          localStorage.setItem(`count of ${i.key}`, JSON.stringify(i.count));
        });
      } catch (err) {
        console.error("Failed to fetch cart", err);
        Swal.fire(
          "Error",
          "Unable to load your cart. Please try again.",
          "error"
        );
      }
    };
    fetchCart();
  }, [jwt_token]);

  const handleRemove = async (foodId) => {
    if (!jwt_token) return;

    try {
      const res = await fetch(`http://localhost:5555/cart/${foodId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwt_token}` },
      });
      if (!res.ok) throw new Error("Failed to remove item");

      setCartItems((prev) => prev.filter((item) => item.key !== foodId));
      localStorage.setItem(`count of ${foodId}`, JSON.stringify(0));
    } catch (err) {
      console.error("Failed to remove", err);
      Swal.fire("Error", "Could not remove item. Please try again.", "error");
    }
  };

  const handleExit = () => {
    Swal.fire({
      title: "Exit Checkout?",
      text: "Your delivery details will not be saved.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Exit",
      cancelButtonText: "Stay",
    }).then((result) => {
      if (result.isConfirmed) setShowCheckout(false);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirmOrder = async () => {
    if (
      !address.firstName ||
      !address.lastName ||
      !address.city ||
      !address.pincode ||
      !address.phone
    ) {
      Swal.fire("Missing Info", "Please fill all fields.", "error");
      return;
    }

    if (cartItems.length === 0) {
      Swal.fire("Empty Cart", "Add items to cart before checkout.", "info");
      return;
    }

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.count,
        })),
        address,
      };

      const response = await fetch("http://localhost:5555/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt_token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error("Failed to place order");

      // Clear backend cart
      if (jwt_token) {
        const clearRes = await fetch("http://localhost:5555/cart/clear", {
          method: "POST",
          headers: { Authorization: `Bearer ${jwt_token}` },
        });
        if (!clearRes.ok) throw new Error("Failed to clear backend cart");
      }

      // Clear local cache
      localStorage.clear();

      Swal.fire({
        title: "Order Placed!",
        text: `Thank you ${address.firstName}, your order has been placed successfully.`,
        icon: "success",
        confirmButtonText: "Okay",
      }).then(() => {
        setShowCheckout(false);
        setAddress({
          firstName: "",
          lastName: "",
          city: "",
          pincode: "",
          phone: "",
        });
        setCartItems([]);
      });
    } catch (error) {
      console.error(error);
      Swal.fire(
        "Error",
        "Something went wrong while placing the order.",
        "error"
      );
    }
  };

  const grandTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.count),
    0
  );

  return (
    <div className="cart-page">
      <Header />

      {!showCheckout ? (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Items</th>
                <th>Title</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Removal</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.key}>
                  <td>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-img"
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>₹{item.price}</td>
                  <td>{item.count}</td>
                  <td>₹{Number(item.price) * Number(item.count)}</td>
                  <td>
                    <button
                      className="remove-button"
                      onClick={() => handleRemove(item.key)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {cartItems.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan="4" className="grand-total-label">
                    Grand Total:
                  </td>
                  <td colSpan="2" className="grand-total-value">
                    ₹{grandTotal}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>

          {cartItems.length === 0 && (
            <p className="empty-cart">Your cart is empty.</p>
          )}

          {cartItems.length > 0 && (
            <div className="checkout-btn-container">
              <button
                className="checkout-button"
                onClick={() => setShowCheckout(true)}
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="checkout-section">
          <h2>Delivery Address</h2>
          <form className="address-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={address.firstName}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={address.lastName}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="city"
              placeholder="City / Village"
              value={address.city}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={address.pincode}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={address.phone}
              onChange={handleInputChange}
            />
          </form>

          <h3>Order Summary</h3>
          <ul className="order-summary">
            {cartItems.map((item) => (
              <li key={item.key}>
                <h5>
                  {item.name} x {item.count} = ₹
                  {Number(item.price) * Number(item.count)}
                </h5>
              </li>
            ))}
          </ul>
          <h3 className="summary-total">Total: ₹{grandTotal}</h3>

          <div className="checkout-actions">
            <button className="exit-button" onClick={handleExit}>
              Exit
            </button>
            <button className="confirm-button" onClick={handleConfirmOrder}>
              Confirm Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
